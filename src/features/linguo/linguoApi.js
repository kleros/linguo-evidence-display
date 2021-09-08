import Linguo from '@kleros/linguo-contracts/artifacts/Linguo.json';
import promiseRetry from '~/shared/promiseRetry';

const chainIdToTokenParams = {
  1: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  42: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  77: {
    name: 'SPOA',
    symbol: 'SPOA',
    decimals: 18,
  },
  100: {
    name: 'xDAI',
    symbol: 'xDAI',
    decimals: 18,
  },
};

export default function createApi({ archon, web3 }) {
  async function getMetaEvidence({ arbitratorContractAddress, arbitrableContractAddress, disputeID }) {
    const chainId = await web3.eth.getChainId();
    const linguoContract = new web3.eth.Contract(Linguo.abi, arbitrableContractAddress);

    const { taskID, price, translatedText } = await _tryGetDataFromContract(linguoContract, {
      arbitrableContractAddress,
      disputeID,
    });

    const metaEvidence = await archon.arbitrable.getMetaEvidence(arbitrableContractAddress, taskID, {
      scriptParameters: {
        disputeID,
        arbitrableContractAddress,
        arbitratorContractAddress,
        jsonRpcUrl: web3.currentProvider.url,
        chainID: web3.currentProvider.chainId,
      },
    });

    metaEvidence.arbitrableInterfaceMetadata = metaEvidence.arbitrableInterfaceMetadata ?? {};

    Object.assign(metaEvidence.arbitrableInterfaceMetadata, {
      disputeID,
      arbitratorContractAddress,
      arbitrableContractAddress,
      task: {
        id: taskID,
        translatedText,
        price,
      },
      token: chainIdToTokenParams[chainId],
    });

    return metaEvidence;
  }

  async function _tryGetDataFromContract(contract, { disputeID }) {
    const taskID = await contract.methods.disputeIDtoTaskID(disputeID).call();

    const disputeEvents =
      (await _getPastEvents(contract, 'Dispute', {
        filter: { _disputeID: disputeID },
        fromBlock: 0,
      })) ?? [];

    if (disputeEvents.length === 0) {
      throw new Error('Invalid dispute');
    }

    const taskIDFromEvent = disputeEvents[0]?.returnValues?._metaEvidenceID;

    if (taskID !== taskIDFromEvent) {
      throw new Error('Invalid dispute');
    }

    const [taskCreatedEvents = [], taskAssignedEvents = [], translationSubmittedEvents = []] = await Promise.all([
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

    // const requester = taskCreatedEvents[0]?.returnValues?._requester;
    const price = taskAssignedEvents[0]?.returnValues?._price;
    const translatedText = translationSubmittedEvents[0]?.returnValues?._translatedText;

    // const [_ignored, translator, challenger] = await contract.methods.getTaskParties(taskID).call();
    return { taskID, price, translatedText };
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
