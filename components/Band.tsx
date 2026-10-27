import { CONFIG } from "@/lib/data";

/** Seamless marquee: the list is repeated so one half is always wider than the viewport. */
export default function Band() {
  const reps = Math.max(2, Math.ceil(16 / CONFIG.band.length));
  const half = Array.from({ length: reps }, () => CONFIG.band).flat();
  return (
    <div className="band" aria-hidden="true">
      <div className="band__track">
        {[...half, ...half].map((w, i) => (
          <span className="band__item" key={i}>
            {w}
            <i>{"{ }"}</i>
          </span>
        ))}
      </div>
    </div>
  );
}
