// src/variants/jobs/rows.tsx
import { useTranslation } from 'react-i18next';
import { readRuntime } from '../../shared/runtime';
import { NS } from './side';

/** A window on the screenshot, in image pixels: x0, y0, width, height, and where
 *  it sits in the frame (left, top). Several windows butt along a 1px rule. */
type Win = [x0: number, y0: number, cw: number, ch: number, l?: number, t?: number];
interface Shot { file: string; size?: [number, number]; desk: Win[]; phone: Win[]; rings: number[][]; max?: number; phoneText?: boolean }

/** The mockup's crops of real WCPOS 2.0 screenshots (1024 × 768 unless `size`).
 *  Rings are the cream highlights, in % of the whole image. The phone windows
 *  are tighter so text in the crop renders at about 11 px or more. */
const ROWS: { key: string; open?: boolean; shot?: Shot }[] = [
  { key: 'refund', open: true, shot: { file: 'jobs-refund', max: 480, phoneText: true, desk: [[478, 84, 534, 164]], phone: [[485, 84, 177, 164], [846, 84, 162, 164, 177]], rings: [[82.8, 17.2, 15.2, 7]] } },
  { key: 'stock', shot: { file: 'jobs-stock', phoneText: true, desk: [[473, 108, 531, 110], [473, 318, 427, 56, 0, 110]], phone: [[615, 108, 389, 110], [615, 318, 279, 56, 0, 110]], rings: [[60.3, 21.5, 37.2, 6.5], [60.3, 41.8, 26.7, 6.5]] } },
  { key: 'order', shot: { file: 'jobs-order', desk: [[465, 418, 559, 350]], phone: [[560, 638, 452, 130]], rings: [[54.6, 91.6, 44.4, 6.9]] } },
  { key: 'reports', shot: { file: 'jobs-reports', desk: [[64, 0, 600, 440]], phone: [[70, 15, 340, 315]], rings: [[7.2, 2.3, 22.3, 4.3], [7.2, 23.7, 16.6, 5.3]] } },
  { key: 'stores', shot: { file: 'jobs-stores', size: [460, 428], max: 460, desk: [[0, 0, 460, 428]], phone: [[10, 222, 440, 198]], rings: [[1.5, 50, 97, 32]] } },
  { key: 'cards' },
];
const ALSO = [1, 2, 3, 4] as const;
const pct = (n: number, of: number) => `${(n / of) * 100}%`;

const Frame = ({ shot, wins, label, className }: { shot: Shot; wins: Win[]; label: string; className: string }) => {
  const base = `${readRuntime().constants.CDN_BASE}/img/${shot.file}`;
  const W = Math.max(...wins.map(([, , cw, , l = 0]) => l + cw));
  const H = Math.max(...wins.map(([, , , ch, , t = 0]) => t + ch));
  const [w, h] = shot.size ?? [1024, 768];
  return (
    <div className={`jobs-frame ${className}`} role="img" aria-label={label} style={{ aspectRatio: `${W} / ${H}`, maxWidth: className === 'jobs-desk' ? shot.max : undefined }}>
      {wins.map(([x0, y0, cw, ch, l = 0, t = 0]) => (
        <div key={`${x0}-${y0}`} className={`jobs-win${l ? ' jobs-div-left' : ''}${t ? ' jobs-div-top' : ''}`} style={{ left: pct(l, W), top: pct(t, H), width: pct(cw, W), height: pct(ch, H) }}>
          <div className="jobs-crop" style={{ width: pct(w, cw), left: pct(-x0, cw), top: pct(-y0, ch) }}>
            <picture>
              <source type="image/webp" srcSet={`${base}.webp`} />
              <img src={`${base}.png`} width={w} height={h} loading="lazy" alt="" />
            </picture>
            {shot.rings.map(([rl, rt, rw, rh]) => (
              <span key={`${rl}-${rt}`} className="jobs-ring" style={{ left: `${rl}%`, top: `${rt}%`, width: `${rw}%`, height: `${rh}%` }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/** Six questions as native <details> rows: the cue words and chevron flip with
 *  [open] in CSS. Pro owners read the same rows as statements. */
export const Questions = ({ proActive }: { proActive: boolean }) => {
  const { t, i18n } = useTranslation(NS);
  const p = proActive ? '_pro' : '';
  const enNote = !i18n.language.startsWith('en') && <span className="jobs-en-note">{t('screen_in_english')}</span>;
  return (
    <section className="jobs-qs" aria-labelledby="jobs-qs-h">
      <h2 className="jobs-lead-in" id="jobs-qs-h">{t(`list_label${p}`)}</h2>
      <div className="jobs-list">
        {ROWS.map(({ key, open, shot }) => {
          const text = (
            <>
              <span className="jobs-ask">{t(`${key}${p}_q`)}</span>
              <span className="jobs-ans">{t(`${key}${p}_a`)}</span>
            </>
          );
          if (!shot) return <div key={key} className="jobs-q"><div className="jobs-row jobs-row-full">{text}</div></div>;
          const caption = t(`${key}_caption`);
          return (
            <details key={key} className="jobs-q" open={open}>
              <summary className="jobs-row">
                {text}
                <span className="jobs-cue"><span className="jobs-c-closed">{t('show_example')}</span><span className="jobs-c-open">{t('hide_example')}</span></span>
              </summary>
              <figure className="jobs-shot">
                <Frame shot={shot} wins={shot.desk} label={t(`${key}_alt`)} className="jobs-desk" />
                <Frame shot={shot} wins={shot.phone} label={t(`${key}_alt${shot.phoneText ? '_phone' : ''}`)} className="jobs-phone" />
                <figcaption className={shot.phoneText ? 'jobs-desk' : undefined}>{caption} {enNote}</figcaption>
                {shot.phoneText && <figcaption className="jobs-phone">{t(`${key}_caption_phone`)} {enNote}</figcaption>}
              </figure>
            </details>
          );
        })}
        <div className="jobs-also">
          <p className="jobs-also-h">{t(`also_title${p}`)}</p>
          <ul>{ALSO.map((n) => <li key={n}>{t(`also${n}`)}</li>)}</ul>
        </div>
      </div>
    </section>
  );
};
