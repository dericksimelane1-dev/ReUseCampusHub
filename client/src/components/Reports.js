import React from 'react';
import '../styles/Reports.css';

const Reports = () => {
  const reports = [
    { id: 101, title: 'Spam Report', submittedBy: 'User123', date: '2025-10-01' },
    { id: 102, title: 'Inappropriate Content', submittedBy: 'User456', date: '2025-10-05' },
    { id: 103, title: 'Fake Listing', submittedBy: 'User789', date: '2025-10-10' },
  ];

  const handleView = (id) => {
    alert(`View report ${id}`);
  };

  const handleArchive = (id) => {
    alert(`Archive report ${id}`);
  };

  return (
    <div className="reports-container">
      <h2>ReUse Reports</h2>
      <table className="reports-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Submitted By</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(report => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>{report.title}</td>
              <td>{report.submittedBy}</td>
              <td>{report.date}</td>
              <td>
                <button onClick={() => handleView(report.id)}>View</button>
                <button onClick={() => handleArchive(report.id)}>Archive</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;