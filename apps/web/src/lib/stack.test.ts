import type { CatalogResponse } from '@cv-rush/contracts';
import { describe, expect, it } from 'vitest';
import { fold, searchTechnologies, stackChips, technologiesForRole } from './stack';

const catalog: CatalogResponse = {
  version: 'test',
  locale: 'en',
  seniorities: ['junior', 'senior'],
  tracks: [{ id: 'fullstack', label: 'Fullstack' }],
  categories: [],
  technologies: [
    { id: 'react', name: 'React', categoryId: 'frontend', aliases: ['reactjs'] },
    { id: 'nodejs', name: 'Node.js', categoryId: 'backend', aliases: ['node'] },
    { id: 'nestjs', name: 'NestJS', categoryId: 'backend', aliases: ['nest'] },
    { id: 'postgresql', name: 'PostgreSQL', categoryId: 'databases', aliases: ['postgres', 'pg'] },
    { id: 'kubernetes', name: 'Kubernetes', categoryId: 'infrastructure', aliases: ['k8s'] },
    { id: 'swift', name: 'Swift', categoryId: 'mobile', aliases: [] },
  ],
  roles: [
    {
      id: 'fullstack_developer',
      label: 'Fullstack Developer',
      trackId: 'fullstack',
      coreCategoryIds: ['frontend', 'backend'],
      allowedCategoryIds: ['databases', 'infrastructure'],
      recommendedTechnologyIds: ['react', 'nodejs'],
    },
  ],
};
const role = catalog.roles[0]!;
const allowed = technologiesForRole(catalog, role);

describe('stack helpers', () => {
  it('folds names for comparison', () => {
    expect(fold('Node.js')).toBe('nodejs');
    expect(fold('  Pós-tgres ')).toBe('postgres');
    expect(fold('C#')).toBe('c#');
  });

  it("offers only the role's categories, core categories first", () => {
    expect(allowed.map((t) => t.id)).toEqual([
      'react',
      'nodejs',
      'nestjs',
      'postgresql',
      'kubernetes',
    ]);
  });

  it('finds technologies by name and alias, prefixes first', () => {
    expect(searchTechnologies(allowed, 'k8s').map((t) => t.id)).toEqual(['kubernetes']);
    expect(searchTechnologies(allowed, 'Postgres').map((t) => t.id)).toEqual(['postgresql']);
    expect(searchTechnologies(allowed, 'nest').map((t) => t.id)).toEqual(['nestjs']);
    expect(searchTechnologies(allowed, 'js').map((t) => t.id)).toEqual([
      'react',
      'nodejs',
      'nestjs',
    ]);
    expect(searchTechnologies(allowed, 'swift')).toEqual([]);
    expect(searchTechnologies(allowed, '  ')).toEqual([]);
  });

  it('shows up to five technologies and counts the rest', () => {
    expect(stackChips(catalog, ['nodejs', 'react'])).toEqual({
      names: ['Node.js', 'React'],
      more: 0,
    });
    const many = ['react', 'nodejs', 'nestjs', 'postgresql', 'kubernetes', 'swift'];
    expect(stackChips(catalog, many)).toEqual({
      names: ['React', 'Node.js', 'NestJS', 'PostgreSQL', 'Kubernetes'],
      more: 1,
    });
  });
});
