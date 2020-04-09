import test from 'ava';
import {JsonFormat, JsonFormatShape} from '../src/decorators/JsonFormat';
import {JsonClass} from '../src/decorators/JsonClass';
import {JsonDeserialize} from '../src/decorators/JsonDeserialize';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';

test('@JsonFormat on properties', t => {
  class Event {
    @JsonProperty()
    name: string;

    @JsonProperty()
    @JsonFormat({
      shape: JsonFormatShape.STRING,
      pattern: 'YYYY-MM-DD hh:mm:ss',
    })
    @JsonClass({class: () => [Date]})
    startDate: Date;

    @JsonProperty()
    @JsonFormat({
      shape: JsonFormatShape.STRING,
      toFixed: 2
    })
    @JsonDeserialize({using: (value: string) => parseFloat(value)})
    price: number;

    @JsonProperty()
    @JsonFormat({
      shape: JsonFormatShape.BOOLEAN
    })
    @JsonDeserialize({using: (value: boolean) => value ? 1 : 0})
    canceled: number;

    @JsonProperty()
    @JsonFormat({
      shape: JsonFormatShape.ARRAY
    })
    @JsonDeserialize({using: (value: string[]) => ({address: value[0], phone: value[1]}) })
    info: {
      address: string;
      phone: string;
    };

    // eslint-disable-next-line no-shadow
    constructor(name: string, startDate: Date, price: number, canceled: number, info: {address: string; phone: string}) {
      this.name = name;
      this.startDate = startDate;
      this.price = price;
      this.canceled = canceled;
      this.info = info;
    }
  }

  const startDate = new Date('2020-03-24 10:00:00');
  const info = {
    address: '123 Main Street, New York, NY 10030',
    phone: '+393333111999'
  };
  const event = new Event('Event 1', startDate, 14.5, 0, info);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Event>(event);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"name":"Event 1","startDate":"2020-03-24 10:00:00","price":"14.50","canceled":false,"info":["123 Main Street, New York, NY 10030","+393333111999"]}'));

  const eventParsed = objectMapper.parse<Event>(jsonData, {mainCreator: () => [Event]});
  t.assert(eventParsed instanceof Event);
  t.deepEqual(eventParsed, event);
});

test('@JsonFormat JsonFormatShape.OBJECT on property', t => {
  class ArrayEx<T> extends Array<T> {
    @JsonProperty()
    wrapper: number[] = [];

    constructor(...args) {
      super();
      this.wrapper = [...args];

      // this line is required for ES5!
      this.constructor = ArrayEx;
    }
  }

  class Example {
    @JsonProperty()
    @JsonFormat({shape: JsonFormatShape.OBJECT})
    @JsonDeserialize({using: (value: {wrapper: number[]}) => value.wrapper})
    @JsonClass({class: () => [ArrayEx]})
    numbers: ArrayEx<number>;
  }

  const example = new Example();
  example.numbers = new ArrayEx(12, 13, 15);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Example>(example);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"numbers":{"wrapper":[12,13,15]}}'));

  const exampleParsed = objectMapper.parse<Example>(jsonData, {mainCreator: () => [Example]});
  t.assert(exampleParsed instanceof Example);
  t.deepEqual(exampleParsed, example);
});

test('@JsonFormat JsonFormatShape.OBJECT on class', t => {
  @JsonFormat({shape: JsonFormatShape.OBJECT})
  class ArrayEx<T> extends Array<T> {
    @JsonProperty()
    wrapper: number[] = [];

    constructor(...args) {
      super();
      this.wrapper = [...args];

      // this line is required for ES5!
      this.constructor = ArrayEx;
    }
  }

  class Example {
    @JsonProperty()
    @JsonDeserialize({using: (value: {wrapper: number[]}) => value.wrapper})
    @JsonClass({class: () => [ArrayEx]})
    numbers: ArrayEx<number>;
  }

  const example = new Example();
  example.numbers = new ArrayEx(12, 13, 15);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Example>(example);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"numbers":{"wrapper":[12,13,15]}}'));

  const exampleParsed = objectMapper.parse<Example>(jsonData, {mainCreator: () => [Example]});
  t.assert(exampleParsed instanceof Example);
  t.deepEqual(exampleParsed, example);
});
