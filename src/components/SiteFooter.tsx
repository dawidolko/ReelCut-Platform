import type { Content } from './content';

export function SiteFooter({ content }: { content: Content }) {
  return (
    <footer className="border-t border-edge bg-panel py-10 text-text-2">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg font-extrabold tracking-tight text-text">ReelCut</p>
          <p className="mt-1 max-w-md text-sm text-text-3">{content.footer.body}</p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <li>
            <a href="https://dawidolko.pl" className="underline-offset-4 hover:text-lime hover:underline">
              {content.footer.author}: Dawid Olko
            </a>
          </li>
          <li>
            <a
              href="https://github.com/dawidolko/ReelCut-Platform"
              className="underline-offset-4 hover:text-lime hover:underline"
            >
              {content.footer.code}
            </a>
          </li>
          <li>
            <a
              href={content.otherLocale.path}
              hrefLang={content.otherLocale.code}
              className="underline-offset-4 hover:text-lime hover:underline"
            >
              {content.otherLocale.label}
            </a>
          </li>
        </ul>
      </div>
      <p className="mx-auto mt-6 max-w-7xl px-4 text-xs text-text-4 sm:px-6">
        &copy; {new Date().getFullYear()} Dawid Olko. {content.footer.rights}
      </p>
    </footer>
  );
}
