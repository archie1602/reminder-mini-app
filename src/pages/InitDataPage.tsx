import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  initDataRaw as _initDataRaw,
  initDataState as _initDataState,
  type User,
  useSignal,
} from '@telegram-apps/sdk-react';

import { DisplayData, type DisplayDataRow } from '@/components/DisplayData/DisplayData.tsx';
import { Page } from '@/components/Page.tsx';

function getUserRows(user: User): DisplayDataRow[] {
  return Object.entries(user).map(([title, value]) => ({ title, value }));
}

export const InitDataPage: FC = () => {
  const { t } = useTranslation();
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);

  const initDataRows = useMemo<DisplayDataRow[] | undefined>(() => {
    if (!initDataState || !initDataRaw) {
      return;
    }
    return [
      { title: 'raw', value: initDataRaw },
      ...Object.entries(initDataState).reduce<DisplayDataRow[]>((acc, [title, value]) => {
        if (value instanceof Date) {
          acc.push({ title, value: value.toISOString() });
        } else if (!value || typeof value !== 'object') {
          acc.push({ title, value });
        }
        return acc;
      }, []),
    ];
  }, [initDataState, initDataRaw]);

  const userRows = useMemo<DisplayDataRow[] | undefined>(() => {
    return initDataState && initDataState.user
      ? getUserRows(initDataState.user)
      : undefined;
  }, [initDataState]);

  const receiverRows = useMemo<DisplayDataRow[] | undefined>(() => {
    return initDataState && initDataState.receiver
      ? getUserRows(initDataState.receiver)
      : undefined;
  }, [initDataState]);

  const chatRows = useMemo<DisplayDataRow[] | undefined>(() => {
    return !initDataState?.chat
      ? undefined
      : Object.entries(initDataState.chat).map(([title, value]) => ({ title, value }));
  }, [initDataState]);

  if (!initDataRows) {
    return (
      <Page>
        <div>
          <h2>{t('initDataPage.errorTitle')}</h2>
          <p>{t('initDataPage.errorMessage')}</p>
          <img
            alt="Telegram sticker"
            src="https://xelene.me/telegram.gif"
            style={{ display: 'block', width: '144px', height: '144px' }}
          />
        </div>
      </Page>
    );
  }
  return (
    <Page>
      <div>
        <DisplayData header={t('initDataPage.title')} rows={initDataRows}/>
        {userRows && <DisplayData header={t('initDataPage.headerUser')} rows={userRows}/>}
        {receiverRows && <DisplayData header={t('initDataPage.headerReceiver')} rows={receiverRows}/>}
        {chatRows && <DisplayData header={t('initDataPage.headerChat')} rows={chatRows}/>}
      </div>
    </Page>
  );
};
