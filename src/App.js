// src/App.js
import React, { useState } from 'react';
import Papa from 'papaparse';
import { Container, Table, Form, Button, Row, Col } from 'react-bootstrap';
import { utils, writeFile } from 'xlsx';

const App = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('');
  const [comparisonOperator, setComparisonOperator] = useState('Greater than');
  const [filterValue, setFilterValue] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setHeaders(Object.keys(result.data[0]));
          setData(result.data);
        },
      });
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    if (name === 'metric') {
      setSelectedMetric(value);
    } else if (name === 'operator') {
      setComparisonOperator(value);
    } else if (name === 'value') {
      setFilterValue(value);
    }
  };

  const applyFilters = (data) => {
    if (!selectedMetric || !filterValue) {
      return data;
    }

    return data.filter((row) => {
      const rowValue = parseFloat(row[selectedMetric]);
      const filterNumericValue = parseFloat(filterValue);

      if (isNaN(rowValue) || isNaN(filterNumericValue)) {
        return true;
      }

      switch (comparisonOperator) {
        case 'Greater than':
          return rowValue > filterNumericValue;
        case 'Less than':
          return rowValue < filterNumericValue;
        case 'Equal to':
          return rowValue === filterNumericValue;
        default:
          return true;
      }
    });
  };

  const filteredData = applyFilters(data);

  const exportToExcel = () => {
    const ws = utils.json_to_sheet(filteredData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Sheet1');
    writeFile(wb, 'filtered_data.xlsx');
  };

  return (
    <Container>
      <h1 className="my-4">Business Quant</h1>
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Upload CSV File</Form.Label>
        <Form.Control type="file" accept=".csv" onChange={handleFileUpload} />
      </Form.Group>
      {headers.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Form.Control as="select" name="metric" onChange={handleFilterChange}>
              <option value="">Select metric</option>
              {headers.map((header, index) => (
                <option key={index} value={header}>
                  {header}
                </option>
              ))}
            </Form.Control>
          </Col>
          <Col>
            <Form.Control as="select" name="operator" onChange={handleFilterChange}>
              <option value="Greater than">Greater than</option>
              <option value="Less than">Less than</option>
              <option value="Equal to">Equal to</option>
            </Form.Control>
          </Col>
          <Col>
            <Form.Control type="number" name="value" placeholder="Enter value" onChange={handleFilterChange} />
          </Col>
          <Col>
            <Button variant="outline-secondary" onClick={() => setFilterValue('')}>
              Clear
            </Button>
          </Col>
          <Col>
            <Button variant="outline-secondary" onClick={exportToExcel}>
              Export to Excel
            </Button>
          </Col>
        </Row>
      )}
      {filteredData.length > 0 && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header, colIndex) => (
                  <td key={colIndex}>{row[header]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default App;
