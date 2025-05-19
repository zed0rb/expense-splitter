import { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Alert } from 'react-bootstrap';
import type { Member } from '../types/Group';

interface Props {
  show: boolean;
  onClose: () => void;
  members: Member[];
  onCreate: (
    paidById: string,
    amount: number,
    description: string,
    splits: Record<string, number>
  ) => Promise<void>;
}

const NewTransactionModal = ({ show, onClose, members, onCreate }: Props) => {
  const [form, setForm] = useState({
    paidById: '',
    amount: '',
    description: '',
    splitType: 'equal' as 'equal' | 'custom',
    customSplits: {} as Record<string, number>,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opening/closing
  useEffect(() => {
    if (show) {
      setForm({
        paidById: '',
        amount: '',
        description: '',
        splitType: 'equal',
        customSplits: {},
      });
      setError('');
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.paidById || !form.amount || !form.description) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreate(
        form.paidById,
        parseFloat(form.amount),
        form.description,
        form.splitType === 'equal' ? {} : form.customSplits
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setForm((prev) => ({ ...prev, amount: value }));
    }
  };

  const handleSplitChange = (memberId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setForm((prev) => ({
      ...prev,
      customSplits: {
        ...prev.customSplits,
        [memberId]: numValue,
      },
    }));
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>New Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Paid By*</Form.Label>
            <Form.Select
              value={form.paidById}
              onChange={(e) => setForm({ ...form, paidById: e.target.value })}
              required
            >
              <option value="">Select member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Amount*</Form.Label>
            <Form.Control
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description*</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Split Type</Form.Label>
            <div>
              <Form.Check
                inline
                label="Equal"
                type="radio"
                checked={form.splitType === 'equal'}
                onChange={() => setForm({ ...form, splitType: 'equal' })}
              />
              <Form.Check
                inline
                label="Custom"
                type="radio"
                checked={form.splitType === 'custom'}
                onChange={() => setForm({ ...form, splitType: 'custom' })}
              />
            </div>
          </Form.Group>

          {form.splitType === 'custom' && (
            <Table striped bordered>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const isPayer = member.id === form.paidById;
                  const amount = form.customSplits[member.id] || 0;
                  const share = isPayer
                    ? (parseFloat(form.amount) || 0) -
                      Object.entries(form.customSplits)
                        .filter(([id]) => id !== form.paidById)
                        .reduce((sum, [_, val]) => sum + val, 0)
                    : amount;

                  return (
                    <tr key={member.id}>
                      <td>
                        {member.name}
                        {isPayer && ' (payer)'}
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          min="0"
                          step="0.01"
                          value={isPayer ? '' : amount}
                          onChange={(e) => !isPayer && handleSplitChange(member.id, e.target.value)}
                          disabled={isPayer}
                          placeholder={isPayer ? 'Auto-calculated' : ''}
                        />
                      </td>
                      <td className={share < 0 ? 'text-danger' : ''}>
                        ${share.toFixed(2)}
                        {isPayer && share < 0 && (
                          <div className="text-danger small">(Adjust other amounts)</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}>
                    <strong>Total</strong>
                  </td>
                  <td>
                    <strong>${(parseFloat(form.amount) || 0).toFixed(2)}</strong>
                  </td>
                </tr>
              </tfoot>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Transaction'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default NewTransactionModal;
