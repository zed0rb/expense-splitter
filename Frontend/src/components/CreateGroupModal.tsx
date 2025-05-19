import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface Props {
  show: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
}

const CreateGroupModal = ({ show, onClose, onCreate }: Props) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim());
    setTitle('');
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">Create New Group</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="groupTitle" className="mb-3">
            <Form.Label className="fw-medium">Group Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Roommates, Trip to Paris"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2 pt-2">
            <Button variant="outline-secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Group
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateGroupModal;
