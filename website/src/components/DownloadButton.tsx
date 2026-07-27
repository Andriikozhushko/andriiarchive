import { release, downloadsLive, assetUrl, type PlatformAsset } from "../config/release";
import { IconDownload, IconArrow } from "./Icons";

interface Props {
  asset: PlatformAsset;
}

/**
 * A single download control. Its behaviour is fully driven by the release
 * state in config/release.ts:
 *
 *  - draft:    disabled; never exposes a private/draft asset URL. Tooltip shows
 *              the honest "under final verification" status.
 *  - published: a real link to the public GitHub Releases asset.
 */
export default function DownloadButton({ asset }: Props) {
  if (downloadsLive) {
    return (
      <a className="btn btn-secondary asset-btn" href={assetUrl(asset)} download>
        <IconDownload /> <span className="btn-text">Download</span>
      </a>
    );
  }

  // Draft: not a link, not a download. Points nowhere; informs the user.
  return (
    <button
      type="button"
      className="btn btn-secondary asset-btn"
      aria-disabled="true"
      disabled
      title={release.draftStatus}
    >
      <IconArrow /> <span className="btn-text">Pending</span>
    </button>
  );
}
