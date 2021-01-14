import React, { useEffect, useState } from 'react';
import { PropTypes as T } from 'prop-types';
import fetch from 'isomorphic-fetch';
import qs from 'qs';

import { buildQS } from '../../utils/url';
import config from '../../config';
import { getCountryBbox } from '../../utils/countries';

import Header, { LoadingHeader, ErrorHeader } from '../../components/header';
import DetailsCard from '../../components/dashboard/details-card';
import LatestMeasurementsCard from '../../components/dashboard/lastest-measurements-card';
import SourcesCard from '../../components/dashboard/sources-card';
import MeasureandsCard from '../../components/dashboard/measurands-card';
import TemporalCoverageCard from '../../components/dashboard/temporal-coverage-card';
import TimeSeriesCard from '../../components/dashboard/time-series-card';
import DatasetLocations from './dataset-locations';
import DateSelector from '../../components/date-selector';
import Pill from '../../components/pill';

const defaultState = {
  fetched: false,
  fetching: false,
  error: null,
  data: null,
};

function Project({ match, history, location }) {
  const { id } = match.params;

  const [dateRange, setDateRange] = useState(
    qs.parse(location.search, { ignoreQueryPrefix: true }).dateRange
  );
  const [isAllLocations, toggleAllLocations] = useState(true);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [{ fetched, fetching, error, data }, setState] = useState(defaultState);

  useEffect(() => {
    let query = qs.parse(location.search, {
      ignoreQueryPrefix: true,
    });
    query.dateRange = dateRange;
    history.push(`${location.pathname}?${buildQS(query)}`);
  }, [dateRange]);

  useEffect(() => {
    fetchData(id);

    return () => {
      setState(defaultState);
    };
  }, []);

  const fetchData = id => {
    setState(state => ({ ...state, fetching: true, error: null }));
    // let query = {
    //   location: selectedLocations,
    // };
    // let f = buildAPIQS(query, { arrayFormat: 'repeat' });
    // fetch(`${config.api}/projects/${encodeURIComponent(id)}?${f}`)
    // TODO: replace line below with above commented out code once filter is working
    fetch(`${config.api}/projects/${encodeURIComponent(id)}`)
      .then(response => {
        if (response.status >= 400) {
          throw new Error('Bad response');
        }
        return response.json();
      })
      .then(
        json => {
          setState(state => ({
            ...state,
            fetched: true,
            fetching: false,
            data: json.results[0],
          }));
        },
        e => {
          console.log('e', e);
          setState(state => ({
            ...state,
            fetched: true,
            fetching: false,
            error: e,
          }));
        }
      );
  };

  if (!fetched && !fetching) {
    return null;
  }

  if (fetching) {
    return <LoadingHeader />;
  }

  if (error || !data) {
    return <ErrorHeader />;
  }

  // Lifecycle stage of different sources.
  const lifecycle = data.sources.map(s => s.lifecycle_stage).filter(Boolean);

  console.log(data)
  return (
    <section className="inpage">
      <Header
        tagline="Datasets"
        title={data.name}
        subtitle={data.subtitle}
        action={{
          api: `${config.apiDocs}`,
          download: () => {},
        }}
        sourceType={data.sourceType}
        isMobile={data.isMobile}
      />
      <div className="inpage__body">
        <DateSelector setDateRange={setDateRange} dateRange={dateRange} />
        {!isAllLocations && (
          <div
            className={'filters, inner'}
            style={{
              display: `grid`,
              gridTemplateRows: `1fr`,
              gridTemplateColumns: `repeat(2, 1fr)`,
            }}
          >
            <div>
              <Pill title={`${selectedLocations.length}/15`} />
            </div>
            <div style={{ display: `flex`, justifyContent: `flex-end` }}>
              <button
                className="nav__action-link"
                onClick={() => fetchData(id)}
              >
                Apply Selection
              </button>
            </div>
          </div>
        )}
        <DatasetLocations
          bbox={data.bbox || getCountryBbox(data.countries[0])}
          locationIds={data.locationIds}
          parameters={data.parameters}
          toggleAllLocations={toggleAllLocations}
          isAllLocations={isAllLocations}
          selectedLocations={selectedLocations}
          setSelectedLocations={setSelectedLocations}
        />
        <header
          className="fold__header inner"
          style={{ gridTemplateColumns: `1fr` }}
        >
          <h1 className="fold__title">Values for selected stations</h1>
        </header>
        <div className="inner dashboard-cards">
          <DetailsCard
            measurements={data.measurements}
            lifecycle={lifecycle}
            date={{
              start: data.firstUpdated,
              end: data.lastUpdated,
            }}
          />
          <LatestMeasurementsCard parameters={data.parameters} />
          <SourcesCard sources={data.sources} />
          <TimeSeriesCard
            projectId={data.id}
            parameters={data.parameters}
            dateRange={dateRange}
            titleInfo={
              'The average value of a pollutant over time during the specified window at each individual node selected and the average values across all locations selected. While locations have varying time intervals over which they report, all time series charts show data at the same intervals. For one day or one month of data the hourly average is shown. For the project lifetime the daily averages are shown. If all locations are selected only the average across all locations is shown, not the individual location values.'
            }
          />
          <MeasureandsCard
            parameters={data.parameters}
            titleInfo={
              "The average of all values and total number of measurements for the available pollutants during the chosen time window and for the selected locations. Keep in mind that not all locations may report the same pollutants. What are we doing when the locations aren't reporting the same pollutants?"
            }
          />
          <TemporalCoverageCard
            parameters={data.parameters}
            dateRange={dateRange}
            spatial="project"
            id={data.name}
            titleInfo={
              'The average number of measurements for each pollutant by hour, day, or month at the selected locations. In some views a window may be turned off if that view is not applicable to the selected time window.'
            }
          />
        </div>
      </div>
    </section>
  );
}

Project.propTypes = {
  match: T.object, // from react-router
  history: T.object,
  location: T.object,
};

export default Project;
