import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';

export const IndexPage: FC = () => {
  const { t } = useTranslation();

  return (
    <Page back={false}>
      <div>
        <h2>{t('indexPage.title')}</h2>
        <p>{t('indexPage.description')}</p>
        <ul>
          <li>
            <Link to="/init-data">
              {t('indexPage.initDataLink')} - {t('indexPage.initDataDescription')}
            </Link>
          </li>
          <li>
            <Link to="/launch-params">
              {t('indexPage.launchParamsLink')} - {t('indexPage.launchParamsDescription')}
            </Link>
          </li>
          <li>
            <Link to="/theme-params">
              {t('indexPage.themeParamsLink')} - {t('indexPage.themeParamsDescription')}
            </Link>
          </li>
        </ul>
      </div>
    </Page>
  );
};
