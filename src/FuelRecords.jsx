import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNotification } from './Notification';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
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
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { visuallyHidden } from '@mui/utils';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

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
          bgcolor: (theme) => theme.palette.primary.main + '22',
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
    const [dense, setDense] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
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
        <Box sx={{ width: { xs: '100%', sm: '100%', md: '100%', lg: '100%' }, maxWidth: 1920, mx: 'auto', position: 'relative' }}>
          <Paper sx={{ width: '100%', mb: 2 }}>
            <EnhancedTableToolbar numSelected={selected.length} />
            <TableContainer>
              <Table
                sx={{
                  width: '100%', // Make table always fit container
                  minWidth: { xs: 0, sm: 0, md: 0, lg: 0 }, // Responsive minWidth
                  '& th, & td': {
                    fontSize: 'clamp(0.75rem, 2.5vw, 1.1rem)',
                    padding: 'clamp(0.3rem, 1.5vw, 1rem) clamp(0.5rem, 2vw, 1.5rem)',
                    wordBreak: 'keep-all',
                    whiteSpace: 'normal',
                  },
                  '& th': {
                    fontWeight: 700,
                  },
                  tableLayout: 'fixed',
                }}
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
                            <TextField type="date" value={editDate} onChange={e => setEditDate(e.target.value)} size="small" />
                          ) : (
                            (() => {
                              // Format: YYYY-MM-DD
                              const [year, month, day] = row.date.split('-');
                              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                              return (
                                <span style={{ display: 'inline-block', textAlign: 'center', width: '100%' }}>
                                  <span style={{ display: 'block', fontWeight: 600 }}>{day} {monthNames[parseInt(month, 10) - 1]}</span>
                                  <span style={{ display: 'block', fontSize: '0.9em', color: '#888' }}>{year}</span>
                                </span>
                              );
                            })()
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {editId === row.id ? (
                            <TextField type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} size="small" />
                          ) : (
                            `RM ${Number(row.amount).toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {editId === row.id ? (
                            <Stack direction="row" spacing={1}>
                              <Button variant="contained" color="success" size="small" onClick={() => handleEditSave(row.id)} disabled={loading}>Save</Button>
                              <Button variant="outlined" color="inherit" size="small" onClick={() => setEditId(null)} disabled={loading}>Cancel</Button>
                            </Stack>
                          ) : (
                            <Stack direction="row" spacing={1}>
                              <Button variant="outlined" color="primary" size="small" onClick={() => handleEdit(row)} disabled={loading}>Edit</Button>
                              <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(row.id)} disabled={loading}>Delete</Button>
                            </Stack>
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
          {/* Floating Action Button */}
          <Fab color="primary" aria-label="add" onClick={() => setAddOpen(true)} sx={{ position: 'fixed', bottom: 88, right: 32, zIndex: 1200 }}>
            <AddIcon />
          </Fab>
          {/* Add Record Dialog */}
          <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
            <DialogTitle>Add Fuel Record</DialogTitle>
            <DialogContent>
              <Box component="form" onSubmit={e => { handleAdd(e); setAddOpen(false); }} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 300 }}>
                <TextField
                    type="number"
                    step="0.01"
                    label="Amount (RM)"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                    size="small"
                    autoFocus
                />
                <TextField
                    type="date"
                    label="Date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    size="small"
                    InputLabelProps={{ shrink: true }}
                />
                <DialogActions>
                  <Button onClick={() => setAddOpen(false)} color="inherit">Cancel</Button>
                  <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ minWidth: 100 }}>
                      Add
                  </Button>
                </DialogActions>
              </Box>
            </DialogContent>
          </Dialog>
          {/* ...existing code... */}
          <Stack direction="row" spacing={1} mb={2}>
              {FILTERS.map(f => (
                  <Button
                      key={f.value}
                      variant={filter === f.value ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => setFilter(f.value)}
                      size="small"
                  >
                      {f.label}
                  </Button>
              ))}
          </Stack>
          <Typography align="right" fontWeight={600} mb={2}>
              Total: RM {total.toFixed(2)}
          </Typography>
          {error && <Typography color="error" mb={2}>{error}</Typography>}
        </Box>
    );
}
