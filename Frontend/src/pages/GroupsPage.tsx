import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Group } from '../types/Group';
import CreateGroupModal from '../components/CreateGroupModal';
import { getGroups, createGroup, getGroupBalances } from '../api/groupsApi';
import { toast } from 'react-toastify';

const GroupsPage = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [balances, setBalances] = useState<Record<string, number>>({});

  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await getGroups();
      setGroups(data);

      // Load balances for each group
      const balancePromises = data.map((group) =>
        getGroupBalances(group.id).catch(() => {
          // If balances fail, just return 0 for creator
          return { [group.creator.id]: 0 };
        })
      );

      const balanceResults = await Promise.all(balancePromises);
      const balanceMap = data.reduce(
        (acc, group, index) => {
          acc[group.id] = balanceResults[index][group.creator.id] || 0;
          return acc;
        },
        {} as Record<string, number>
      );

      setBalances(balanceMap);
    } catch (err) {
      console.error('Error fetching groups', err);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (title: string) => {
    try {
      const newGroup = await createGroup(title);
      setGroups((prev) => [...prev, newGroup]);
      setBalances((prev) => ({
        ...prev,
        [newGroup.id]: 0,
      }));
      toast.success('Group created successfully');
    } catch (err) {
      console.error('Error creating group', err);
      toast.error('Failed to create group');
    }
  };

  const getBalanceText = (groupId: string) => {
    const balance = balances[groupId] || 0;
    if (balance === 0) return 'Settled up';
    return balance > 0
      ? `You are owed $${balance.toFixed(2)}`
      : `You owe $${Math.abs(balance).toFixed(2)}`;
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return 'bi-arrow-up-circle-fill text-success';
    if (balance < 0) return 'bi-arrow-down-circle-fill text-danger';
    return 'bi-check-circle-fill text-muted';
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Your Groups</h2>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-lg"></i>
          Create Group
        </button>
      </div>

      <CreateGroupModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateGroup}
      />

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : groups.length === 0 ? (
        <div className="card text-center py-5">
          <i className="bi bi-people-fill fs-1 text-muted mb-3"></i>
          <h4 className="mb-3">No groups yet</h4>
          <p className="text-muted mb-3">Create your first group to start sharing expenses</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Create Group
          </button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {groups.map((group) => (
            <div key={group.id} className="col">
              <div
                className="card h-100 hover-shadow"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title fw-bold mb-3">{group.title}</h5>
                    <span className="badge bg-light text-dark">
                      {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div
                    className={`d-flex align-items-center ${
                      balances[group.id] > 0
                        ? 'text-success'
                        : balances[group.id] < 0
                          ? 'text-danger'
                          : 'text-muted'
                    }`}
                  >
                    <i className={`bi ${getBalanceIcon(balances[group.id])} me-2`}></i>
                    {getBalanceText(group.id)}
                  </div>
                </div>
                <div className="card-footer bg-transparent">
                  <small className="text-muted">
                    Created on {new Date(group.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
