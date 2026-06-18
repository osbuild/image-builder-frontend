import React from 'react';

import path from 'path';

import cockpit from 'cockpit';

import { AMPLITUDE_MODULE_NAME } from '@/constants';
import { ComposesResponseItem, LocalUploadStatus } from '@/store/api/backend';

type Analytics = {
  track: (event: string, props?: Record<string, unknown>) => void;
};

export const defaultActions = (
  compose: ComposesResponseItem,
  analytics: Analytics,
  account_id: string | undefined,
  isOnPremise: boolean,
  options: LocalUploadStatus | undefined,
  isMachinesAvailable: boolean,
) => {
  const name = `request-${compose.id}.json`;

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();

    const data = JSON.stringify(compose.request, null, 2);
    const blob = new Blob([data], { type: 'application/json' });

    const url = URL.createObjectURL(blob);
    // In cockpit we're running in an iframe, the current content-security policy
    // (set in cockpit/public/manifest.json) only allows resources from the same origin as the
    // document (which is unique to the iframe). So create the element in the parent document.
    const link = isOnPremise
      ? window.parent.document.createElement('a')
      : document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);

    if (!isOnPremise) {
      analytics.track(`${AMPLITUDE_MODULE_NAME} - File Downloaded`, {
        module: AMPLITUDE_MODULE_NAME,
        link_name: name,
        current_path: window.location.pathname,
        account_id: account_id || 'Not found',
      });
    }
  };

  const actions = [
    {
      title: 'Download compose request (.json)',
      onClick: handleDownload,
    },
  ];

  if (isOnPremise && isMachinesAvailable && options?.artifact_path) {
    const parsedPath = path.parse(options.artifact_path);
    const fileBrowserHref =
      '/files#/?path=' + encodeURIComponent(parsedPath.dir);

    const handleOpenInFileBrowser = (e: React.MouseEvent) => {
      e.preventDefault();
      cockpit.jump(fileBrowserHref, cockpit.transport.host);
    };

    actions.push({
      title: 'Open in file browser',
      onClick: handleOpenInFileBrowser,
    });
  }

  return actions;
};
