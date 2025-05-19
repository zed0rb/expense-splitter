import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getGroup,
  addMember,
  removeMember,
  getGroupTransactions,
  createTransaction,
  getGroupBalances,
} from '../api/groupsApi';
import type { Group, Transaction } from '../types/Group';
import AddMemberForm from '../components/AddMemberForm';
import NewTransactionModal from '../components/NewTransactionModal';
import { toast } from 'react-toastify';

const GroupDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewTxModal, setShowNewTxModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadGroup(id);
      loadTransactions(id);
      loadBalances(id);
    }
  }, [id]);

  const loadGroup = async (groupId: string) => {
    try {
      setLoading(true);
      const data = await getGroup(groupId);
      setGroup(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load group', err);
      setError('Failed to load group.');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (groupId: string) => {
    try {
      const data = await getGroupTransactions(groupId);
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions', err);
      toast.error('Failed to load transactions');
    }
  };

  const loadBalances = async (groupId: string) => {
    try {
      const balances = await getGroupBalances(groupId);
      setBalances(balances);
    } catch (err) {
      console.error('Failed to load balances', err);
      if (group) {
        const emptyBalances = group.members.reduce(
          (acc, member) => {
            acc[member.id] = 0;
            return acc;
          },
          {} as Record<string, number>
        );
        setBalances(emptyBalances);
      }
      toast.error('Failed to load balances');
    }
  };

  const handleAddMember = async (name: string) => {
    if (!group) return;
    try {
      setError(null);
      const newMember = await addMember(group.id, name);
      setGroup({
        ...group,
        members: [...group.members, newMember],
      });
      await loadBalances(group.id);
      toast.success('Member added successfully');
    } catch (err: any) {
      const [status] = err.message.split(':', 2);
      if (status === '409') {
        setError(`A member named "${name}" already exists.`);
      } else {
        setError('Failed to add member. Please try again.');
      }
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!group || memberId === group.creator.id) return;
    try {
      await removeMember(group.id, memberId);
      setGroup({
        ...group,
        members: group.members.filter((m) => m.id !== memberId),
      });
      await loadBalances(group.id);
      toast.success('Member removed successfully');
    } catch (err) {
      console.error('Failed to remove member', err);
      setError('Failed to remove member. They may have outstanding balances.');
    }
  };

  const handleCreateTransaction = async (
    paidById: string,
    amount: number,
    description: string,
    splits: Record<string, number>
  ) => {
    if (!group) return;
    try {
      await createTransaction(group.id, {
        paidById,
        amount,
        description,
        splits,
      });

      await Promise.all([loadGroup(group.id), loadTransactions(group.id), loadBalances(group.id)]);

      toast.success('Transaction created successfully');
    } catch (err) {
      console.error('Failed to create transaction', err);
      toast.error('Failed to create transaction. Please try again.');
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  if (!group) return <div className="alert alert-danger mt-3">Group not found.</div>;

  const allMembers = group.members;
  const creatorBalance = balances[group.creator.id] || 0;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button onClick={() => navigate('/')} className="btn btn-outline-secondary">
          ← Back to Groups
        </button>
        <h2>{group.title}</h2>
        <div></div> {/* Empty div for spacing */}
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Group Summary</h5>
          <div className="mb-3">
            <strong>Your Balance:</strong>
            {creatorBalance > 0 ? (
              <span className="text-success"> You are owed ${creatorBalance.toFixed(2)}</span>
            ) : creatorBalance < 0 ? (
              <span className="text-danger"> You owe ${Math.abs(creatorBalance).toFixed(2)}</span>
            ) : (
              <span className="text-muted"> All settled up</span>
            )}
          </div>
          <div className="text-muted">
            Created on {new Date(group.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Members</h5>
          {error && <div className="alert alert-danger">{error}</div>}

          <ul className="list-group mb-3">
            {allMembers.map((member) => {
              const balance = balances[member.id] || 0;
              const isCreator = member.id === group.creator.id;

              return (
                <li
                  key={member.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    {member.name}
                    {isCreator && <span className="badge bg-primary ms-2">Creator</span>}
                  </div>
                  <div>
                    <span
                      className={`me-3 ${balance > 0 ? 'text-success' : balance < 0 ? 'text-danger' : 'text-muted'}`}
                    >
                      {balance > 0 && `is owed $${balance.toFixed(2)}`}
                      {balance < 0 && `owes $${Math.abs(balance).toFixed(2)}`}
                      {balance === 0 && 'settled'}
                    </span>
                    {!isCreator && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <AddMemberForm onAdd={handleAddMember} />
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Transactions</h5>
            <button
              className="btn btn-success"
              onClick={() => setShowNewTxModal(true)}
              disabled={allMembers.length < 2}
            >
              + New Transaction
            </button>
          </div>

          {allMembers.length < 2 && (
            <div className="alert alert-warning">
              You need at least 2 members to create a transaction.
            </div>
          )}

          {transactions.length === 0 ? (
            <div className="alert alert-info">No transactions yet.</div>
          ) : (
            <div className="list-group">
              {transactions.map((tx) => (
                <div key={tx.id} className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <div>
                      <strong>{tx.paidBy.name}</strong> paid ${tx.amount.toFixed(2)}
                      {tx.description && <span> - {tx.description}</span>}
                    </div>
                    <small className="text-muted">{new Date(tx.date).toLocaleString()}</small>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">
                      <strong>Splits:</strong>{' '}
                      {tx.splits.map((s) => `${s.memberName}: $${s.amount.toFixed(2)}`).join(', ')}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <NewTransactionModal
        show={showNewTxModal}
        onClose={() => setShowNewTxModal(false)}
        members={allMembers}
        onCreate={handleCreateTransaction}
      />
    </div>
  );
};

export default GroupDetailsPage;
