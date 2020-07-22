import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Alert, Button, Descriptions, Tooltip, Typography, Spin } from 'antd';
import { DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { generateUrl } from '~/app/ipfs';
import languages from '~/assets/languages.json';
import translationTiers from '~/assets/translationTiers.json';
import { useEtherscanAddress } from '~/features/etherscan';
import { getTaskUrl } from '~/features/linguo';
import useObjectUrl from '~/shared/useObjectUrl';
import FormattedCryptoCurrency from '~/shared/FormattedCryptoCurrency';
import FormattedDate from '~/shared/FormattedDate';
import LinguoEvidenceFetcher from '~/shared/LinguoEvidenceFetcher';

export default function LinguoEvidence() {
  return (
    <LinguoEvidenceFetcher
      render={({ data, isLoading }) => {
        return (
          <Spin
            spinning={isLoading}
            tip="Getting evidence..."
            css={`
              position: fixed !important;
              left: 50% !important;
              top: 50% !important;
              transform: translate(-50%, -50%);
            `}
          >
            <div
              css={`
                width: calc(100vw - 0.5rem);
                padding: 1rem;
              `}
            >
              {data && <LinguoEvidenceDisplay data={data} />}
            </div>
          </Spin>
        );
      }}
    />
  );
}

function LinguoEvidenceDisplay({ data }) {
  const { metaEvidenceJSONValid: valid, metaEvidenceJSON, arbitrableInterfaceURI, arbitrableInterfaceMetadata } = data;
  const { token, task, arbitrableContractAddress } = arbitrableInterfaceMetadata ?? {};
  const { aliases, metadata } = metaEvidenceJSON;

  const { title, text } = metadata;
  const tier = translationTiers[metadata.expectedQuality] ?? '<Unknown Tier>';
  const sourceLanguage = languages[metadata.sourceLanguage] ?? '<Unknown Language>';
  const targetLanguage = languages[metadata.targetLanguage] ?? '<Unknown Language>';
  // Deadline is stored as Unix Timestamp (without milliseconds)
  const deadline = new Date(metadata.deadline * 1000);
  const maxPrice = normalizeWei(metadata.maxPrice, token.decimals);
  const minPrice = normalizeWei(metadata.minPrice, token.decimals);
  const assignedPrice = normalizeWei(task.price, token.decimals);
  const parties = Object.entries(aliases).reduce(
    (acc, [address, party]) =>
      address === 'undefined'
        ? acc
        : Object.assign(acc, {
            [party]: address,
          }),
    {}
  );
  const translator = parties.Translator;
  const challenger = parties.Challenger;
  const requester = parties.Requester ?? challenger;

  return (
    <>
      {!valid && (
        <Alert
          type="warning"
          message="This is not a valid MetaEvidence"
          description={
            <>
              The data shown bellow does not comply with the{' '}
              <a href="https://github.com/ethereum/EIPs/issues/1497" target="_blank" rel="noreferrer noopener">
                ERC-1497: Evidence Standard
              </a>
              .
            </>
          }
          css={`
            margin-bottom: 2rem;
          `}
        />
      )}
      <Typography.Paragraph>
        <a
          href={
            arbitrableInterfaceURI ??
            getTaskUrl({
              contractAddress: arbitrableContractAddress,
              taskID: task.id,
            })
          }
          target="_blank"
          rel="noreferrer noopener"
        >
          View task in Linguo
        </a>
      </Typography.Paragraph>
      <Typography.Paragraph>Here is the relevant data:</Typography.Paragraph>
      <Descriptions bordered size="small" column={{ xxl: 3, xl: 3, lg: 3, md: 3, sm: 1, xs: 1 }}>
        <Descriptions.Item label="Quality Tier" span={3}>
          {tier}
        </Descriptions.Item>
        <Descriptions.Item label="Source Language" span={1.5}>
          {sourceLanguage}
        </Descriptions.Item>
        <Descriptions.Item label="Target Language" span={1.5}>
          {targetLanguage}
        </Descriptions.Item>
        <Descriptions.Item label="Original Text" span={1.5}>
          <Button
            icon={<DownloadOutlined />}
            href={useObjectUrl(text)}
            target="_blank"
            rel="noopener noreferrer"
            css={`
              width: 12rem;
            `}
          >
            View Original Text
          </Button>
        </Descriptions.Item>
        <Descriptions.Item label="Translated Text" span={1.5}>
          <Button
            icon={<DownloadOutlined />}
            href={generateUrl(task.translatedText)}
            target="_blank"
            rel="noopener noreferrer"
            css={`
              width: 12rem;
            `}
          >
            View Translated Text
          </Button>
        </Descriptions.Item>
        <Descriptions.Item label="Title" span={3}>
          {title}
        </Descriptions.Item>
        <Descriptions.Item label="Deadline" span={3}>
          {<FormattedDate value={deadline} />}
        </Descriptions.Item>
        <Descriptions.Item label="Assigned Price" span={1}>
          <StyledTooltip
            title={<FormattedCryptoCurrency value={assignedPrice} symbol={token.symbol} decimals={token.decimals} />}
          >
            <span>
              <FormattedCryptoCurrency value={assignedPrice} symbol={token.symbol} /> <QuestionCircleOutlined />
            </span>
          </StyledTooltip>
        </Descriptions.Item>
        <Descriptions.Item label="Minimum Price" span={1}>
          <StyledTooltip
            title={<FormattedCryptoCurrency value={minPrice} symbol={token.symbol} decimals={token.decimals} />}
          >
            <span>
              <FormattedCryptoCurrency value={minPrice} symbol={token.symbol} /> <QuestionCircleOutlined />
            </span>
          </StyledTooltip>
        </Descriptions.Item>
        <Descriptions.Item label="Maximum Price" span={1}>
          <StyledTooltip
            title={<FormattedCryptoCurrency value={maxPrice} symbol={token.symbol} decimals={token.decimals} />}
          >
            <span>
              <FormattedCryptoCurrency value={maxPrice} symbol={token.symbol} /> <QuestionCircleOutlined />
            </span>
          </StyledTooltip>
        </Descriptions.Item>
        <Descriptions.Item label="Requester" span={3}>
          <a href={useEtherscanAddress(requester)} target="_blank" rel="noopener noreferrer">
            {requester}
          </a>
        </Descriptions.Item>
        <Descriptions.Item label="Translator" span={3}>
          <a href={useEtherscanAddress(translator)} target="_blank" rel="noopener noreferrer">
            {translator}
          </a>
        </Descriptions.Item>
        <Descriptions.Item label="Challenger" span={3}>
          <a href={useEtherscanAddress(challenger)} target="_blank" rel="noopener noreferrer">
            {challenger}
          </a>
        </Descriptions.Item>
      </Descriptions>
    </>
  );
}

function normalizeWei(amount, decimals) {
  decimals = parseInt(decimals, 10);
  const maxDecimals = 18;

  const suffix = '0'.repeat(Math.abs(maxDecimals - decimals));

  return `${amount}${suffix}`;
}

LinguoEvidenceDisplay.propTypes = {
  data: t.objectOf(t.any).isRequired,
};

const StyledTooltip = styled(Tooltip)`
  cursor: help;
`;
