import React, { useEffect, useState } from 'react';
import { PropTypes as T } from 'prop-types';
import styled from 'styled-components';
import LoadingMessage from '../../components/loading-message';
import InfoMessage from '../../components/info-message';
import TemporalChart from '../../components/bar-chart-measurment';
import Card, {
  CardHeader as BaseHeader,
  CardTitle,
} from '../../components/card';
import TabbedSelector from '../../components/tabbed-selector';

const ErrorMessage = styled.div`
  grid-column: 1 / -1;
`;
const CardHeader = styled(BaseHeader)`
  display: grid;
  grid-template-rows: min-content 1fr 1fr;
  grid-gap: 0.5rem;
`;

export default function TemporalMeasurements({ measurements, parameters }) {
  const { fetched, fetching, error } = measurements;
  const [activeTab, setActiveTab] = useState(parameters[0]);
  const [activeTabMeasurements, setActiveTabMeasurements] = useState([]);
  const [hourCoverage, setHourCoverage] = useState([]);
  const [dayCoverage, setDayCoverage] = useState([]);
  const [monthCoverage, setMonthCoverage] = useState([]);

  useEffect(() => {
    if(fetched) {
      const tabMeasurements = measurements.data.results.filter(f => f.parameter === activeTab.id)
      setActiveTabMeasurements(tabMeasurements)
      setHourCoverage(parseHour(tabMeasurements))
      setDayCoverage(parseDay(tabMeasurements))
      setMonthCoverage(parseMonth(tabMeasurements))
    }
  }, [fetched, activeTab]);

  if (!fetched && !fetching) {
    return null;
  }

const parseHour = (measurements) => (
  measurements.reduce((prev, curr) => {
      const hour = new Date(curr.date.local).getHours()
    prev[hour] = prev[hour] ? prev[hour] + 1 : 1
      return prev
    }, {})
)

const parseDay = (measurements) => (
  measurements.reduce((prev, curr) => {
      const daysOfWeek = ['SUN', 'MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT']
      const day = daysOfWeek[new Date(curr.date.local).getDay()]
    prev[day] = prev[day] ? prev[day] + 1 : 1
      return prev
    }, {})
)

const parseMonth = (measurements) => (
  measurements.reduce((prev, curr) => {
      const monthOfYear = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUNE', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
      const month = monthOfYear[new Date(curr.date.local).getMonth()]
    prev[month] = prev[month] ? prev[month] + 1 : 1
      return prev
    }, {})
)

  if (fetching) {
    return <LoadingMessage />;
  } else if (error) {
    return (
      <ErrorMessage>
        <p>We couldn&apos;t get any data.</p>
        <InfoMessage>
          <p>Please try again later.</p>
          <p>
            If you think there&apos;s a problem, please{' '}
            <a href="mailto:info@openaq.org" title="Contact openaq">
              contact us.
            </a>
          </p>
        </InfoMessage>
      </ErrorMessage>
    );
  }

  return (
    <Card
      gridColumn={'1  / -1'}
      renderHeader={() => (
        <CardHeader className="card__header">
          <TabbedSelector
            tabs={parameters}
            activeTab={activeTab}
            onTabSelect={t => {
              setActiveTab(t);
            }}
          />
          <CardTitle>Temporal Coverage</CardTitle>
        </CardHeader>
      )}
      renderBody={() => (
        <div className="card__body">
          <TemporalChart
            title="Hour of the Day"
            frequency={Object.values(hourCoverage)}
            xAxisLabels={Object.keys(hourCoverage)}
          />

          <TemporalChart
            title="Day of the Week"
            frequency={Object.values(dayCoverage)}
            xAxisLabels={Object.keys(dayCoverage)}
          />

          <TemporalChart
            title="Month of the Year"
            frequency={Object.values(monthCoverage)}
            xAxisLabels={Object.keys(monthCoverage)}
          />
        </div>
      )}
      renderFooter={() => null}
    />
  );
}

TemporalMeasurements.propTypes = {
  parameters: T.array,

  measurements: T.shape({
    fetching: T.bool,
    fetched: T.bool,
    error: T.string,
    data: T.object,
  }),
};
