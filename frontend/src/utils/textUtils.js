
  export function truncateText (text, maxLength) {
    if (typeof text !== 'string') return '';
    return text.length > maxLength ? text.slice(0, maxLength - 1) + '…' : text;
  };
  export function sanitizeText (text){
    return text.replace(/</g,'&lt;').replace(/>/g,'&gt;');
};
