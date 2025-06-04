import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';
import { useNotification } from './Notification';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { visuallyHidden } from '@mui/utils';

const FILTERS = [
    { label: '1 Month', value: '1m' },
    { label: '3 Months', value: '3m' },
    { label: '1 Year', value: '1y' },
    { label: 'All Time', value: 'all' },
];

function getDateFilter(value) {
    const now = new Date();
    if (value === '1m') now.setMonth(now.getMonth() - 1);
    else if (value === '3m') now.setMonth(now.getMonth() - 3);
    else if (value === '1y') now.setFullYear(now.getFullYear() - 1);
    else return null;
    return now.toISOString().slice(0, 10);
}

// Sorting helpers (copied from MUI EnhancedTable)
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
  { id: 'date', numeric: false, disablePadding: false, label: 'Date' },
  { id: 'amount', numeric: true, disablePadding: false, label: 'Amount (RM)' },
  { id: 'action', numeric: false, disablePadding: false, label: 'Action' },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id !== 'action' ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function EnhancedTableToolbar({ numSelected }) {
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            theme.palette.primary.main + '22',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
          Fuel Records
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

export default function FuelRecords() {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [records, setRecords] = useState([]);
    const [filter, setFilter] = useState('1m');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editId, setEditId] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [editDate, setEditDate] = useState('');
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('date');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [dense, setDense] = useState(false);
    const notify = useNotification();

    const fetchRecords = async () => {
        setLoading(true);
        setError('');
        let query = supabase.from('fuel_records').select('*').order('date', { ascending: false });
        const fromDate = getDateFilter(filter);
        if (fromDate) query = query.gte('date', fromDate);
        const { data, error } = await query;
        if (error) setError(error.message);
        else setRecords(data);
        setLoading(false);
    };

    useEffect(() => { fetchRecords(); }, [filter]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const user = (await supabase.auth.getUser()).data.user;
        const { error } = await supabase.from('fuel_records').insert({
            user_id: user.id,
            amount: parseFloat(amount),
            date,
        });
        if (error) {
            setError(error.message);
            notify(error.message, 'error');
        } else {
            notify('Fuel record added', 'success');
        }
        setAmount('');
        setDate('');
        fetchRecords();
        setLoading(false);
    };

    const handleEdit = (record) => {
        setEditId(record.id);
        setEditAmount(record.amount);
        setEditDate(record.date);
    };
    const handleEditSave = async (id) => {
        setLoading(true);
        setError('');
        const { error } = await supabase.from('fuel_records').update({
            amount: parseFloat(editAmount),
            date: editDate,
        }).eq('id', id);
        if (error) {
            setError(error.message);
            notify(error.message, 'error');
        } else {
            notify('Fuel record updated', 'success');
        }
        setEditId(null);
        setEditAmount('');
        setEditDate('');
        fetchRecords();
        setLoading(false);
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        setLoading(true);
        setError('');
        const { error } = await supabase.from('fuel_records').delete().eq('id', id);
        if (error) {
            setError(error.message);
            notify(error.message, 'error');
        } else {
            notify('Fuel record deleted', 'success');
        }
        fetchRecords();
        setLoading(false);
    };

    const handleRequestSort = (event, property) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    };
    const handleSelectAllClick = (event) => {
      if (event.target.checked) {
        const newSelected = records.map((n) => n.id);
        setSelected(newSelected);
        return;
      }
      setSelected([]);
    };
    const handleClick = (event, id) => {
      const selectedIndex = selected.indexOf(id);
      let newSelected = [];
      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1),
        );
      }
      setSelected(newSelected);
    };
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
    const handleChangeDense = (event) => {
      setDense(event.target.checked);
    };

    const total = records.reduce((sum, r) => sum + Number(r.amount), 0);

    const emptyRows =
      page > 0 ? Math.max(0, (1 + page) * rowsPerPage - records.length) : 0;

    const visibleRows = React.useMemo(
      () =>
        [...records]
          .sort(getComparator(order, orderBy))
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
      [order, orderBy, page, rowsPerPage, records],
    );

    return (
        <Box sx={{ width: '100%' }}>
          <Paper sx={{ width: '100%', mb: 2 }}>
            <EnhancedTableToolbar numSelected={selected.length} />
            <TableContainer>
              <Table
                sx={{ minWidth: 650 }}
                size={dense ? 'small' : 'medium'}
              >
                <EnhancedTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {visibleRows.map((row, index) => {
                    const isItemSelected = selected.includes(row.id);
                    const labelId = `enhanced-table-checkbox-${index}`;
                    return (
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, row.id)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.id}
                        selected={isItemSelected}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell component="th" id={labelId} scope="row">
                          {editId === row.id ? (
                            <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} style={{ width: '120px', border: '1.5px solid #f59e42', borderRadius: 6, padding: '4px 8px' }} />
                          ) : (
                            row.date
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {editId === row.id ? (
                            <input type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} style={{ width: '90px', border: '1.5px solid #f59e42', borderRadius: 6, padding: '4px 8px' }} />
                          ) : (
                            `RM ${Number(row.amount).toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {editId === row.id ? (
                            <>
                              <button style={{ marginRight: 4, background: '#22c55e', padding: '6px 10px' }} onClick={() => handleEditSave(row.id)} disabled={loading} aria-label="Save">
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
                                  <path d="M5 10.5l4 4 6-7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              <button className="secondary" style={{ background: '#e5e7eb', color: '#222', padding: '6px 10px' }} onClick={() => setEditId(null)} disabled={loading} aria-label="Cancel">
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
                                  <line x1="6" y1="6" x2="14" y2="14" stroke="#222" strokeWidth="2.2" strokeLinecap="round"/>
                                  <line x1="14" y1="6" x2="6" y2="14" stroke="#222" strokeWidth="2.2" strokeLinecap="round"/>
                                </svg>
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="table-action-btn edit" onClick={() => handleEdit(row)} disabled={loading} aria-label="Edit">
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
                                  <path d="M4 13.5V16h2.5l7.06-7.06-2.5-2.5L4 13.5z" fill="#2563eb"/>
                                  <path d="M14.85 6.15a1 1 0 0 0 0-1.41l-1.59-1.59a1 1 0 0 0-1.41 0l-1.13 1.13 2.5 2.5 1.13-1.13z" fill="#2563eb"/>
                                </svg>
                              </button>
                              <button className="table-action-btn delete" onClick={() => handleDelete(row.id)} disabled={loading} aria-label="Delete">
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
                                  <path d="M6 7v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                                  <path d="M9 9v4M11 9v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                                  <rect x="4" y="4" width="12" height="2" rx="1" fill="#e11d48"/>
                                </svg>
                              </button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                      <TableCell colSpan={3} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={records.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
          <FormControlLabel
            control={<Switch checked={dense} onChange={handleChangeDense} />}
            label="Dense padding"
          />
          <form onSubmit={handleAdd} className="form-grid">
              <input
                  type="number"
                  step="0.01"
                  placeholder="Amount (RM)"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
              />
              <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
              />
              <button style={{ gridColumn: '1 / -1' }} disabled={loading}>
                  Add
              </button>
          </form>
          <div style={{ marginBottom: '0.5em', display: 'flex', gap: '0.5em' }}>
              {FILTERS.map(f => (
                  <button
                      key={f.value}
                      className={filter === f.value ? '' : 'secondary'}
                      style={{ fontWeight: filter === f.value ? 'bold' : 'normal' }}
                      onClick={() => setFilter(f.value)}
                      type="button"
                  >
                      {f.label}
                  </button>
              ))}
          </div>
          <div style={{ marginBottom: '0.5em', textAlign: 'right', fontWeight: 600 }}>
              Total: RM {total.toFixed(2)}
          </div>
          {error && <div style={{ color: '#e11d48', marginBottom: '0.5em' }}>{error}</div>}
        </Box>
    );
}
