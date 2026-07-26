import React from 'react';
import AdminBorrowingsList from '../../../components/borrowings/AdminBorrowingsList';
import { bookIssueApi } from '../../../api/api';

const fetchActiveBorrowings = async (params) => {
  return await bookIssueApi.adminGetActiveBorrowings(params);
};

const AdminActiveBorrowings = () => {
  return (
    <div className="p-4">
      <AdminBorrowingsList
        fetchBorrowings={fetchActiveBorrowings}
        title="Active Borrowings"
        defaultSortBy="dueDate"
        defaultIsDescending={false}
        defaultPageSize={10}
        showActions
      />
    </div>
  );
};

export default AdminActiveBorrowings;