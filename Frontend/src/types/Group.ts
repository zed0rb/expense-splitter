export type Member = {
  id: string;
  name: string;
  isCreator?: boolean;
};

export type SplitDetail = {
  memberId: string;
  memberName: string;
  amount: number;
};

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  date: string;
  paidBy: Member;
  splits: SplitDetail[];
};

export type Group = {
  id: string;
  title: string;
  createdAt: string;
  creator: Member;
  members: Member[];
};
