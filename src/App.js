import { useState } from 'react';
import './App.css';

function App() {
  const [form, setForm] = useState({
    drydock_period: '',
    idle_days: '',
    region: '',
    drydock_period_check: false,
    fuel_saving_check: false,
    speed_loss_check: false,
    idle_days_check: false,
  });

  const [resultText, setResultText] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResultText('');
    setError('');
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value);
    });

    try {
      const response = await fetch('https://antifouling-tool.onrender.com/calculate', {
        method: 'POST',
        body: data,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      let display = `Selected Priorities: ${result.priorities.join(', ')}\n\n`;
      result.results.forEach((r, i) => {
        display += `${i + 1}: ${r.oem} - ${r.offering}\nSpeed Loss: ${r.speed_loss}%\nCost: $${r.cost}, Fuel Saving: ${r.fuel_saving}%, Activity: ${r.activity}\nRegion: ${r.region}\n\n`;
      });
      setResultText(display);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="background-container">
      <div className="main-container">
        <div className="form-container">
          <h1>Premium Hull Paint Selector</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Drydock Period (Months):</label>
              <input type="number" name="drydock_period" value={form.drydock_period} onChange={handleChange} required step="0.1" />
            </div>
            <div className="form-group">
              <label>Idle Days (Days):</label>
              <input type="number" name="idle_days" value={form.idle_days} onChange={handleChange} required step="0.1" />
            </div>
            <div className="form-group">
              <label>Suitable Region:</label>
              <input type="text" name="region" value={form.region} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <h3>Select Priorities:</h3>
              <div className="checkbox-group">
                <input type="checkbox" name="drydock_period_check" checked={form.drydock_period_check} onChange={handleChange} />
                <label>Drydock Period</label>
              </div>
              <div className="checkbox-group">
                <input type="checkbox" name="fuel_saving_check" checked={form.fuel_saving_check} onChange={handleChange} />
                <label>Fuel Saving</label>
              </div>
              <div className="checkbox-group">
                <input type="checkbox" name="speed_loss_check" checked={form.speed_loss_check} onChange={handleChange} />
                <label>Speed Loss</label>
              </div>
              <div className="checkbox-group">
                <input type="checkbox" name="idle_days_check" checked={form.idle_days_check} onChange={handleChange} />
                <label>Idle Days</label>
              </div>
            </div>
            <button type="submit">Find Best Options</button>
          </form>
        </div>
        <div className="results-container">
          <div id="results">
            <h3>Results</h3>
            <div className="result-box">
              {error && <p style={{ color: 'red' }}>{error}</p>}
              <pre>{resultText}</pre>
            </div>
          </div>
        </div>
        <div className="instruction-container">
          <h2>Instructions</h2>
          <ul>
            <li>Enter the required details: Drydock Period, Idle Days, and Region.</li>
            <li>Select one or more priorities (e.g., Speed Loss, Fuel Saving).</li>
            <li>Click 'Find Best Options' to view the top 3 recommendations.</li>
            <li>Weights will be distributed equally among selected priorities.</li>
            <li>Results include OEM, offering details, and performance metrics.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
