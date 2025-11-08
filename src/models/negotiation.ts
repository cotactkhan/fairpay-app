
// export interface Negotiation {
//   negotiationId: number;
//   employer: string;
//   candidate: string;
//   title: string;
//   state: NegotiationState;
//   createdAt: number;
//   deadline: number;
//   hasMatchResult: boolean;
//   matchRevealed: boolean;
//   meetingPoint: number;
// }

// export enum NegotiationState {
//   NOT_STARTED = 0,
//   EMPLOYER_SUBMITTED = 1,
//   CANDIDATE_PENDING_VALIDATION = 2,
//   CANDIDATE_SUBMITTED = 3,
//   COMPLETED = 4
// }

// export const STATE_NAMES: Record<NegotiationState, string> = {
//   [NegotiationState.NOT_STARTED]: 'Waiting for Employer',
//   [NegotiationState.EMPLOYER_SUBMITTED]: 'Waiting for Candidate',
//   [NegotiationState.CANDIDATE_PENDING_VALIDATION]: 'Validating Candidate Range',
//   [NegotiationState.CANDIDATE_SUBMITTED]: 'Calculating Match',
//   [NegotiationState.COMPLETED]: 'Completed'
// };


export enum NegotiationState {
  NOT_STARTED = 0,
  EMPLOYER_SUBMITTED = 1,
  CANDIDATE_SUBMITTED = 2,
  MATCH_CALCULATED = 3,
  COMPLETED = 4
}

export const STATE_NAMES: { [key in NegotiationState]: string } = {
  [NegotiationState.NOT_STARTED]: 'Not Started',
  [NegotiationState.EMPLOYER_SUBMITTED]: 'Employer Submitted',
  [NegotiationState.CANDIDATE_SUBMITTED]: 'Candidate Submitted',
  [NegotiationState.MATCH_CALCULATED]: 'Match Calculated',
  [NegotiationState.COMPLETED]: 'Completed'
};

export interface Negotiation {
  negotiationId: number;
  employer: string;
  candidate: string;
  title: string;
  state: NegotiationState;
  createdAt: number;
  deadline: number;
  hasMatchResult: boolean;
  matchRevealed: boolean;
  meetingPoint: number;
  hasMatch?: boolean;
}