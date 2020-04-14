import test from 'ava';
import {JsonInject} from '../src/decorators/JsonInject';
import {JsonClass} from '../src/decorators/JsonClass';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonSetter} from "../src/decorators/JsonSetter";

test('@JsonInject at property level', t => {
  class CurrencyRate {
    @JsonProperty()
    pair: string;
    @JsonProperty()
    rate: number;

    @JsonInject()
    @JsonProperty()
    @JsonClass({class: () => [Date]})
    lastUpdated: Date;
  }

  const objectMapper = new ObjectMapper();
  const jsonData = '{"pair":"USD/JPY","rate":109.15}';
  const now = new Date();

  const currencyRate = objectMapper.parse<CurrencyRate>(jsonData, {
    mainCreator: () => [CurrencyRate],
    injectableValues: {
      lastUpdated: now
    }
  });
  t.assert(currencyRate instanceof CurrencyRate);
  t.is(currencyRate.pair, 'USD/JPY');
  t.is(currencyRate.rate, 109.15);
  t.deepEqual(currencyRate.lastUpdated, now);
});

test('@JsonInject at method level', t => {
  class CurrencyRate {
    @JsonProperty()
    pair: string;
    @JsonProperty()
    rate: number;

    @JsonProperty()
    @JsonClass({class: () => [Date]})
    lastUpdated: Date;

    @JsonSetter()
    @JsonInject()
    setLastUpdated(@JsonClass({class: () => [Date]}) lastUpdated: Date) {
      this.lastUpdated = lastUpdated;
    }
  }

  const objectMapper = new ObjectMapper();
  const jsonData = '{"pair":"USD/JPY","rate":109.15}';
  const now = new Date();

  const currencyRate = objectMapper.parse<CurrencyRate>(jsonData, {
    mainCreator: () => [CurrencyRate],
    injectableValues: {
      lastUpdated: now
    }
  });
  t.assert(currencyRate instanceof CurrencyRate);
  t.is(currencyRate.pair, 'USD/JPY');
  t.is(currencyRate.rate, 109.15);
  t.deepEqual(currencyRate.lastUpdated, now);
});

test('@JsonInject with useInput false', t => {
  class CurrencyRate {
    @JsonProperty()
    pair: string;
    @JsonProperty()
    rate: number;

    @JsonInject({useInput: false})
    @JsonProperty()
    @JsonClass({class: () => [Date]})
    lastUpdated: Date;
  }

  const objectMapper = new ObjectMapper();
  const jsonData = '{"pair":"USD/JPY","rate":109.15,"lastUpdated":"2020-03-21T21:10:03.388Z"}';
  const now = new Date();

  const currencyRate = objectMapper.parse<CurrencyRate>(jsonData, {
    mainCreator: () => [CurrencyRate],
    injectableValues: {
      lastUpdated: now
    }
  });
  t.assert(currencyRate instanceof CurrencyRate);
  t.is(currencyRate.pair, 'USD/JPY');
  t.is(currencyRate.rate, 109.15);
  t.deepEqual(currencyRate.lastUpdated, now);
});

test('@JsonInject with useInput true', t => {
  class CurrencyRate {
    @JsonProperty()
    pair: string;
    @JsonProperty()
    rate: number;

    @JsonInject({useInput: true})
    @JsonProperty()
    @JsonClass({class: () => [Date]})
    lastUpdated: Date;
  }

  const objectMapper = new ObjectMapper();
  const jsonData = '{"pair":"USD/JPY","rate":109.15,"lastUpdated":"2020-03-21T21:10:03.388Z"}';
  const now = new Date();

  const currencyRate = objectMapper.parse<CurrencyRate>(jsonData, {
    mainCreator: () => [CurrencyRate],
    injectableValues: {
      lastUpdated: now
    }
  });
  t.assert(currencyRate instanceof CurrencyRate);
  t.is(currencyRate.pair, 'USD/JPY');
  t.is(currencyRate.rate, 109.15);
  t.deepEqual(currencyRate.lastUpdated, new Date('2020-03-21T21:10:03.388Z'));
});

test('@JsonInject on constructor parameter and different value', t => {
  class CurrencyRate {
    @JsonProperty()
    pair: string;
    @JsonProperty()
    rate: number;

    @JsonProperty()
    @JsonClass({class: () => [Date]})
    lastUpdated: Date;

    constructor(pair: string, rate: number, @JsonInject({value: 'lastValue'}) lastUpdated: Date) {
      this.pair = pair;
      this.rate = rate;
      this.lastUpdated = lastUpdated;
    }
  }

  const objectMapper = new ObjectMapper();
  const jsonData = '{"pair":"USD/JPY","rate":109.15}';
  const now = new Date();

  const currencyRate = objectMapper.parse<CurrencyRate>(jsonData, {
    mainCreator: () => [CurrencyRate],
    injectableValues: {
      lastValue: now
    }
  });
  t.assert(currencyRate instanceof CurrencyRate);
  t.is(currencyRate.pair, 'USD/JPY');
  t.is(currencyRate.rate, 109.15);
  t.deepEqual(currencyRate.lastUpdated, now);
});
