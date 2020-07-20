import { Linguo, LinguoToken } from '@kleros/contract-deployments/linguo';
import any from 'promise.any';
import erc20Abi from '~/assets/abis/ERC20.json';
import promiseRetry from '~/shared/promiseRetry';

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

export default function createApi({ archon, web3 }) {
  async function getMetaEvidence({ arbitrableContractAddress, disputeID }) {
    const linguoContract = new web3.eth.Contract(Linguo.abi, arbitrableContractAddress);
    const linguoTokenContract = new web3.eth.Contract(LinguoToken.abi, arbitrableContractAddress);

    const { metaEvidence, price, translatedText, taskID } = await any([
      _tryGetDataFromContract(linguoContract, {
        arbitrableContractAddress,
        disputeID,
      }),
      _tryGetDataFromContract(linguoTokenContract, {
        arbitrableContractAddress,
        disputeID,
      }),
    ]);

    metaEvidence.aggregateData = {
      contract: {
        address: arbitrableContractAddress,
      },
      task: {
        translatedText,
        price,
        id: taskID,
      },
    };

    const token = metaEvidence.metaEvidenceJSON?.metadata?.token ?? ADDRESS_ZERO;

    if (ADDRESS_ZERO === token) {
      Object.assign(metaEvidence.aggregateData, {
        token: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
      });
    } else {
      const erc20 = new web3.eth.Contract(erc20Abi, token);
      const [nameResult, symbolResult, decimalsResult] = await Promise.allSettled([
        erc20.methods.name().call(),
        erc20.methods.symbol().call(),
        erc20.methods.decimals().call(),
      ]);

      Object.assign(metaEvidence.aggregateData, {
        token: {
          name: nameResult.status === 'fulfilled' ? nameResult.value : '<Unknown Name>',
          symbol: symbolResult.status === 'fulfilled' ? symbolResult.value : '<Unknown Symbol>',
          decimals: decimalsResult.status === 'fulfilled' ? decimalsResult.value : 18,
        },
      });
    }

    return metaEvidence;
  }

  async function _tryGetDataFromContract(contract, { arbitrableContractAddress, disputeID }) {
    const taskID = await contract.methods.disputeIDtoTaskID(disputeID).call();

    const disputeEvents = await _getPastEvents(contract, 'Dispute', {
      filter: { _disputeID: disputeID },
      fromBlock: 0,
    });

    if (disputeEvents.length === 0) {
      throw new Error('Invalid dispute');
    }

    const taskIDFromEvent = disputeEvents[0]?.returnValues?._metaEvidenceID;

    if (taskID !== taskIDFromEvent) {
      throw new Error('Invalid dispute');
    }

    const [taskCreatedEvents, taskAssignedEvents, translationSubmittedEvents] = await Promise.all([
      _getPastEvents(contract, 'TaskCreated', {
        filter: { _taskID: taskID },
        fromBlock: 0,
      }),
      _getPastEvents(contract, 'TaskAssigned', {
        filter: { _taskID: taskID },
        fromBlock: 0,
      }),
      _getPastEvents(contract, 'TranslationSubmitted', {
        filter: { _taskID: taskID },
        fromBlock: 0,
      }),
    ]);

    if (taskCreatedEvents.length === 0 || taskAssignedEvents.length === 0 || translationSubmittedEvents.length === 0) {
      throw new Error('Invalid dispute');
    }

    const requester = taskCreatedEvents[0]?.returnValues?._requester;
    const price = taskAssignedEvents[0]?.returnValues?._price;
    const translatedText = translationSubmittedEvents[0]?.returnValues?._translatedText;

    const [_ignored, translator, challenger] = await contract.methods.getTaskParties(taskID).call();

    const metaEvidence = await archon.arbitrable.getMetaEvidence(arbitrableContractAddress, taskID, {
      scriptParameters: {
        requester,
        translator,
        challenger,
      },
    });

    return { metaEvidence, price, translatedText, taskID };
  }

  async function _getPastEvents(contract, eventName, { filter, fromBlock = 0, toBlock = 'latest' } = {}) {
    return promiseRetry(
      contract
        .getPastEvents(eventName, {
          fromBlock,
          toBlock,
          filter,
        })
        .then(events => {
          if (events.some(({ event }) => event === undefined)) {
            console.warn('Failed to get log values for event', { eventName, filter, events });
            throw new Error('Failed to get log values for event');
          }

          return events;
        }),
      {
        maxAttempts: 5,
        delay: count => 500 + count * 1000,
        shouldRetry: err => err.message === 'Failed to get log values for event',
      }
    );
  }

  return {
    getMetaEvidence,
  };
}
