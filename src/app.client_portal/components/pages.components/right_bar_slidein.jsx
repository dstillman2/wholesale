import React from 'react';

function RightBarSlidein() {
  return (
    <div id="qv-invoice-add" className="quickview quickview-lg">
      <header className="quickview-header">
        <p className="quickview-title lead fw-400">Create new invoice</p>
        <span className="close"><i className="ti-close" /></span>
      </header>
      <div className="quickview-body">
        <div className="quickview-block form-type-material">
          <h6>Details</h6>
          <div className="form-group">
            <input type="text" className="form-control" />
            <label>Client</label>
          </div>
          <div className="form-group">
            <input type="text" className="form-control" />
            <label>Invoice Number</label>
          </div>
          <div className="form-group">
            <input type="text" className="form-control" data-provide="datepicker" />
            <label>Invoice Date</label>
          </div>
          <div className="form-group">
            <input type="text" className="form-control" data-provide="datepicker" />
            <label>Due Date</label>
          </div>
          <div className="form-group input-group">
            <div className="input-group-input">
              <input type="text" className="form-control" />
              <label>Discount</label>
            </div>
            <select data-provide="selectpicker">
              <option>Percent</option>
              <option>Amount</option>
            </select>
          </div>
          <div className="form-group">
            <textarea className="form-control" rows="3" />
            <label>Note to client</label>
          </div>
          <div className="h-40px" />
          <h6>Products</h6>
          <div className="form-group input-group align-items-center">
            <select title="Item" data-provide="selectpicker" data-width="100%">
              <option>Website design</option>
              <option>PSD to HTML</option>
              <option>Website re-design</option>
              <option>UI Kit</option>
              <option>Full Package</option>
            </select>
            <div className="input-group-input">
              <input type="text" className="form-control" />
              <label>Quantity</label>
            </div>
            <a className="text-danger pl-12" id="btn-remove-item" href="#" title="Remove" data-provide="tooltip"><i className="ti-close" /></a>
          </div>
          <a className="btn btn-sm btn-primary" id="btn-new-item" href="#"><i className="ti-plus fs-10"></i> New item</a>
        </div>
      </div>

      <footer className="p-12 text-right">
        <button className="btn btn-flat btn-secondary" type="button" data-toggle="quickview">Cancel</button>
        <button className="btn btn-flat btn-primary" type="submit">Create invoice</button>
      </footer>
    </div>
  );
}

export default RightBarSlidein;
