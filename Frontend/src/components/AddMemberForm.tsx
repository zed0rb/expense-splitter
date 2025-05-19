import { useState } from 'react';

interface Props {
  onAdd: (name: string) => void;
}

const AddMemberForm = ({ onAdd }: Props) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex mb-3">
      <input
        type="text"
        placeholder="Member name"
        className="form-control me-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button className="btn btn-primary" type="submit">
        Add
      </button>
    </form>
  );
};

export default AddMemberForm;
