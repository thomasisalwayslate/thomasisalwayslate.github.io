/** Copy only source text; never the button label or line-number decorations. */
export async function copyCode(code: HTMLElement): Promise<void> {
  const text = code.textContent ?? '';
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Older browsers can still select the command and use the native Copy action.
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(code);
  selection?.removeAllRanges();
  selection?.addRange(range);
  throw new Error('Clipboard unavailable');
}

export function addCodeCopyButtons(root: ParentNode = document): void {
  const copyIcon = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg>';
  const checkIcon = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg>';
  root.querySelectorAll<HTMLElement>('.article-body pre').forEach(pre => {
    const code = pre.querySelector<HTMLElement>('code');
    if (!code || pre.parentElement?.classList.contains('code-block')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.setAttribute('aria-label', 'Copy code');
    button.dataset.label = 'Copy';
    button.innerHTML = copyIcon;
    const status = document.createElement('span');
    status.className = 'copy-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    pre.before(wrapper);
    wrapper.append(pre, button, status);
    let reset: ReturnType<typeof setTimeout> | undefined;
    button.addEventListener('click', async () => {
      if (reset) clearTimeout(reset);
      button.disabled = true;
      try {
        await copyCode(code);
        button.innerHTML = checkIcon;
        button.dataset.label = 'Copied!';
        button.setAttribute('aria-label', 'Code copied');
        button.dataset.copied = 'true';
        status.textContent = 'Code copied to clipboard.';
      } catch {
        button.dataset.label = 'Select code';
        button.setAttribute('aria-label', 'Copy failed. Select code to copy manually');
        status.textContent = 'Could not copy automatically. Select the code and use Copy.';
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(code);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } finally {
        button.disabled = false;
        reset = setTimeout(() => {
          button.innerHTML = copyIcon;
          button.dataset.label = 'Copy';
          button.setAttribute('aria-label', 'Copy code');
          delete button.dataset.copied;
          status.textContent = '';
        }, 2200);
      }
    });
  });
}
