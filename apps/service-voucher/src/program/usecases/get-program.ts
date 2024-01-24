import { IProgramRepository } from "../repository";

export interface IGetProgramDependency {
  programRepository: IProgramRepository;
}

export default (dependency: IGetProgramDependency) => {
  const { programRepository } = dependency;
  return async (id: number) => {
    const program = await programRepository.getOneEntityOrFail(
      id, ["hotels", "rules.categories.parent_category"]
    );
    return program;
  };
};
