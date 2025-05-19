import type { Group, Member, Transaction } from '../types/Group.ts';

const API_BASE = 'http://localhost:5171';

export async function getGroups(): Promise<Group[]> {
  const res = await fetch(`${API_BASE}/api/groups`);
  if (!res.ok) throw new Error('Failed to fetch groups');
  const groups = await res.json();
  return groups.map((group: any) => ({
    ...group,
    members: [{ ...group.creator, isCreator: true }, ...group.members],
  }));
}

export async function createGroup(title: string): Promise<Group> {
  const res = await fetch(`${API_BASE}/api/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) throw new Error('Failed to create group');
  const data = await res.json();
  return {
    ...data,
    members: [{ ...data.creator, isCreator: true }, ...data.members],
  };
}

export async function getGroup(id: string): Promise<Group> {
  const res = await fetch(`${API_BASE}/api/groups/${id}`);
  if (!res.ok) throw new Error('Failed to fetch group');
  const data = await res.json();
  return {
    ...data,
    members: [
      { ...data.creator, isCreator: true },
      ...data.members.filter((m: Member) => m.id !== data.creator.id),
    ],
  };
}

export async function addMember(groupId: string, name: string): Promise<Member> {
  const res = await fetch(`${API_BASE}/api/groups/${groupId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`${res.status}:${errorText}`);
  }

  return await res.json();
}

export async function removeMember(groupId: string, memberId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/groups/${groupId}/members/${memberId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove member');
}

export async function getGroupTransactions(groupId: string): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE}/api/groups/${groupId}/transactions`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return await res.json();
}

export const createTransaction = async (
  groupId: string,
  transaction: {
    paidById: string;
    amount: number;
    description: string;
    splits: Record<string, number>;
  }
): Promise<Transaction> => {
  const response = await fetch(`${API_BASE}/api/groups/${groupId}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to create transaction');
  }

  return await response.json();
};

export async function getGroupBalances(groupId: string): Promise<Record<string, number>> {
  const res = await fetch(`${API_BASE}/api/groups/${groupId}/balances`);
  if (!res.ok) throw new Error('Failed to fetch group balances');
  return await res.json();
}
