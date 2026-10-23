import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

test('module dependencies follow the architecture and classes have matching files', () => {
  const allowed: Record<string, string[]> = {
    model: ['model'], application: ['application', 'model'],
    commands: ['commands', 'application', 'model'],
    cli: ['cli', 'commands', 'application'], infrastructure: ['infrastructure', 'application', 'model']
  };
  for (const [module, dependencies] of Object.entries(allowed)) {
    for (const file of readdirSync(join('src', module)).filter(name => name.endsWith('.ts'))) {
      const source = readFileSync(join('src', module, file), 'utf8');
      const classes = [...source.matchAll(/export (?:abstract )?class (\w+)/g)];
      assert.ok(classes.length <= 1, `${module}/${file}: one class per file`);
      if (classes.length) assert.equal(`${classes[0]![1]}.ts`, file);
      for (const match of source.matchAll(/from ['"]([^'"]+)['"]/g)) {
        const path = match[1]!;
        if (path.startsWith('../')) assert.ok(dependencies.includes(path.split('/')[1]!), `${module} must not depend on ${path}`);
        else if (!path.startsWith('./')) assert.ok(['cli', 'infrastructure'].includes(module), `${module} must not import IO/external dependency ${path}`);
      }
    }
  }
});
