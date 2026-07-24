import UserBorrowingsList from '../../../components/borrowings/UserBorrowingsList';

export default function ActiveBorrowings() {
  return (
    <UserBorrowingsList
      statuses={['active', 'overdue']}
      title="Active & Overdue Borrowings"
      emptyMessage="You have no active or overdue borrowings."
    />
  );
}