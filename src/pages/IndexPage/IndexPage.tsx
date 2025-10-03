import type { FC } from 'react';

import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';

export const IndexPage: FC = () => {
  return (
    <Page back={false}>
      <div>
        <h2>Application Launch Data</h2>
        <p>These pages help developer to learn more about current launch information</p>
        <ul>
          <li>
            <Link to="/init-data">
              Init Data - User data, chat information, technical data
            </Link>
          </li>
          <li>
            <Link to="/launch-params">
              Launch Parameters - Platform identifier, Mini Apps version, etc.
            </Link>
          </li>
          <li>
            <Link to="/theme-params">
              Theme Parameters - Telegram application palette information
            </Link>
          </li>
        </ul>
      </div>
    </Page>
  );
};
