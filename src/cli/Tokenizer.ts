export class Tokenizer {
  parse(line: string): string[] {
    if (!line.trim() || line.trimStart().startsWith('#')) return [];
    const tokens: string[] = [];
    let token = '', quoted = false, active = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i]!;
      if (char === '"') { quoted = !quoted; active = true; }
      else if (quoted && char === '\\' && ['"', '\\'].includes(line[i + 1] ?? '')) { token += line[++i]!; }
      else if (!quoted && /\s/.test(char)) {
        if (active) { tokens.push(token); token = ''; active = false; }
      } else { token += char; active = true; }
    }
    if (quoted) throw new Error('unterminated double quote');
    if (active) tokens.push(token);
    return tokens;
  }
}
