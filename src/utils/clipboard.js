// 텍스트 복사를 처리하는 브라우저 안전 유틸 함수다.
export async function copyText(text) {
  const value = String(text ?? '');
  const clipboard = globalThis.navigator?.clipboard;

  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(value);
      return true;
    } catch {
      return copyTextWithExecCommand(value);
    }
  }

  return copyTextWithExecCommand(value);
}

function copyTextWithExecCommand(text) {
  const documentRef = globalThis.document;

  if (!documentRef?.execCommand || !documentRef?.body) {
    return false;
  }

  const textarea = documentRef.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.opacity = '0';

  documentRef.body.append(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  try {
    return documentRef.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}
