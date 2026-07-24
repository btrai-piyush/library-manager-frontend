import UserBorrowingsList from '../../../components/borrowings/UserBorrowingsList';

export default function BorrowingHistory() {
  return (
    <UserBorrowingsList
      statuses={['returned']}
      title="Borrowing History"
      emptyMessage="No returned borrowings yet."
    />
  );
}