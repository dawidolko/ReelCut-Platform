import type { Content } from './content';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { Editor } from './Editor';

/*
 * The page. Polish and English share this component and differ only in the
 * content object, so a layout fix can never reach one language alone.
 */
export function LandingPage({ content }: { content: Content }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-lime focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-base"
      >
        {content.common.skipToContent}
      </a>

      <SiteHeader content={content} />

      <main id="main-content">
        {/* Hero */}
        <section className="border-b border-edge">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-edge bg-panel px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-lime">
                ReelCut
              </p>
              <h1 className="font-display text-4xl font-extrabold leading-[1.06] tracking-tight text-text sm:text-5xl">
                {content.hero.heading}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-3">{content.hero.lead}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#editor"
                  className="rounded-lg bg-lime px-6 py-3 text-sm font-semibold text-base transition-colors hover:bg-lime-2"
                >
                  {content.hero.cta}
                </a>
                <a
                  href="#how"
                  className="rounded-lg border border-edge px-6 py-3 text-sm font-semibold text-text transition-colors hover:border-lime hover:text-lime"
                >
                  {content.hero.ctaSecondary}
                </a>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-3">
                {content.hero.badges.map((badge) => (
                  <li key={badge} className="flex items-center gap-2">
                    <span aria-hidden="true" className="text-lime">✓</span>
                    {badge}
                  </li>
                ))}
              </ul>
            </div>

            {/* A frame from the cutting room: photo, crop guides, timeline. */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-edge bg-panel p-3">
                <div className="relative overflow-hidden rounded-lg bg-black">
                  <img
                    src="/img/hero.webp"
                    alt=""
                    width={1600}
                    height={1100}
                    className="aspect-video w-full object-cover opacity-90"
                    loading="eager"
                    decoding="async"
                  />
                  {/* The 9:16 crop, drawn over the frame. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-2 border-lime/80"
                    style={{ aspectRatio: '9 / 16' }}
                  >
                    <span className="absolute -top-px left-1/2 -translate-x-1/2 -translate-y-full rounded-t bg-lime px-2 py-0.5 text-[10px] font-bold text-base">
                      9:16
                    </span>
                  </div>
                </div>

                {/* Timeline sketch */}
                <div aria-hidden="true" className="mt-3 flex gap-1">
                  <div className="h-10 flex-[3] rounded bg-lime/25" />
                  <div className="rc-piece-off h-10 flex-[2] rounded bg-panel-2" />
                  <div className="h-10 flex-[4] rounded bg-lime/25" />
                  <div className="rc-piece-off h-10 flex-[1] rounded bg-panel-2" />
                </div>
                <div aria-hidden="true" className="relative mt-2 h-1 rounded-full bg-edge">
                  <div className="absolute left-[45%] top-1/2 h-4 w-0.5 -translate-y-1/2 bg-lime" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {content.benefits.map((benefit, index) => (
                <li key={benefit.title} className="rounded-xl border border-edge bg-panel p-6">
                  <span aria-hidden="true" className="font-display text-sm font-bold tabular-nums text-lime">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="mt-2 font-display text-lg font-bold text-text">{benefit.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-text-3">{benefit.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Editor */}
        <Editor content={content} />

        {/* How it works */}
        <section id="how" className="scroll-mt-20 border-t border-edge py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-center">
              <div>
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
                  {content.how.title}
                </h2>
                <p className="mt-3 max-w-2xl text-text-3">{content.how.intro}</p>

                <ol className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {content.how.steps.map((step, index) => (
                    <li key={step.title} className="rounded-xl border border-edge bg-panel p-6">
                      <span
                        aria-hidden="true"
                        className="grid size-8 place-items-center rounded-full bg-lime font-display text-sm font-bold text-base"
                      >
                        {index + 1}
                      </span>
                      <h3 className="mt-3 font-display text-base font-bold text-text">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-text-3">{step.body}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <img
                src="/img/cut.webp"
                alt=""
                width={1200}
                height={800}
                className="hidden aspect-[3/4] w-full rounded-2xl border border-edge object-cover opacity-90 lg:block"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </section>

        {/* FAQ — details/summary only, no JavaScript. */}
        <section id="faq" className="scroll-mt-20 border-t border-edge py-14 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
              {content.faq.title}
            </h2>
            <div className="mt-8 divide-y divide-edge border-y border-edge">
              {content.faq.items.map((item) => (
                <details key={item.question} className="group py-4">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-display text-base font-semibold text-text marker:content-['']">
                    {item.question}
                    <span aria-hidden="true" className="shrink-0 text-lime transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-text-3">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter content={content} />
    </>
  );
}
