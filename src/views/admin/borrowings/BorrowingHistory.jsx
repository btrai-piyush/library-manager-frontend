import React from 'react';
import AdminBorrowingsList from '../../../components/borrowings/AdminBorrowingsList';
import { bookIssueApi } from '../../../api/api';

const fetchHistoryBorrowings = async (params) => {
  return await bookIssueApi.adminGetBorrowingHistory(params);
};

const AdminBorrowingHistory = () => {
  return (
    <div className="p-4">
      <AdminBorrowingsList
        fetchBorrowings={fetchHistoryBorrowings}
        title="Borrowing History"
        defaultSortBy="issuedDate"
        defaultIsDescending={true}
        defaultPageSize={10}
      />
    </div>
  );
};

export default AdminBorrowingHistory;