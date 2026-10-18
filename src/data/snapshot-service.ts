import type { GarciaDataSnapshot } from '../domain/entities';
import type { GarciaReadRepository } from '../domain/repository-contract';

export interface SnapshotService {
  load(): Promise<GarciaDataSnapshot>;
}

export function createSnapshotService(repository: GarciaReadRepository): SnapshotService {
  return {
    load: () => repository.loadSnapshot(),
  };
}
