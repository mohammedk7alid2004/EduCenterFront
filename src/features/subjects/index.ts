export { SubjectsPage } from './subjects-page';
export type {
  SubjectDto,
  SubjectDetail,
  SubjectFilters,
  CreateSubjectPayload,
  UpdateSubjectPayload,
  DeleteSubjectsPayload,
  PaginatedList,
  ApiResult,
} from './subjects.types';
export {
  useSubjects,
  useSubject,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubjects,
  useToggleSubjectStatus,
} from './subjects.queries';
