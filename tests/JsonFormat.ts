import test from 'ava';
import {
  JsonFormat,
  ObjectMapper,
  JsonFormatShape,
  JsonClass,
  JsonDeserialize
} from '../src';

test('@JsonFormat on properties', t => {
  class Event {
    name: string;

    @JsonFormat({
      shape: JsonFormatShape.STRING,
      pattern: 'YYYY-MM-DD hh:mm:ss',
    })
    @JsonClass({class: () => [Date]})
    startDate: Date;

    @JsonFormat({
      shape: JsonFormatShape.STRING,
      toFixed: 2
    })
    @JsonDeserialize({using: (value: string) => parseFloat(value)})
    price: number;

    @JsonFormat({
      shape: JsonFormatShape.BOOLEAN
    })
    @JsonDeserialize({using: (value: boolean) => value ? 1 : 0})
    canceled: number;

    @JsonFormat({
      shape: JsonFormatShape.ARRAY
    })
    @JsonDeserialize({using: (value: string[]) => ({address: value[0], phone: value[1]}) })
    info: {
      address: string;
      phone: string;
    };

    constructor(name: string, startDate: Date, price: number, canceled: number, info: {address: string; phone: string;}) {
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
  t.is(jsonData, '{"name":"Event 1","startDate":"2020-03-24 10:00:00","price":"14.50","canceled":false,"info":["123 Main Street, New York, NY 10030","+393333111999"]}');

  const eventParsed = objectMapper.parse<Event>(jsonData, {mainCreator: () => [Event]});
  t.assert(eventParsed instanceof Event);
  t.deepEqual(eventParsed, event);
});

test('@JsonFormat JsonFormatShape.OBJECT on property', t => {
  class ArrayEx<T> extends Array<T> {
    wrapper: number[] = [];

    constructor(...args) {
      super();
      this.wrapper = [...args];

      // this line is required for ES5!
      this.constructor = ArrayEx;
    }
  }

  class Example {
    @JsonFormat({shape: JsonFormatShape.OBJECT})
    @JsonDeserialize({using: (value: {wrapper: number[]}) => value.wrapper})
    @JsonClass({class: () => [ArrayEx]})
    numbers: ArrayEx<number>;
  }

  const example = new Example();
  example.numbers = new ArrayEx(12, 13, 15);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Example>(example);
  t.is(jsonData, '{"numbers":{"wrapper":[12,13,15]}}');

  const exampleParsed = objectMapper.parse<Example>(jsonData, {mainCreator: () => [Example]});
  t.assert(exampleParsed instanceof Example);
  t.deepEqual(exampleParsed, example);
});

test('@JsonFormat JsonFormatShape.OBJECT on class', t => {
  @JsonFormat({shape: JsonFormatShape.OBJECT})
  class ArrayEx<T> extends Array<T> {
    wrapper: number[] = [];

    constructor(...args) {
      super();
      this.wrapper = [...args];

      // this line is required for ES5!
      this.constructor = ArrayEx;
    }
  }

  class Example {
    @JsonDeserialize({using: (value: {wrapper: number[]}) => value.wrapper})
    @JsonClass({class: () => [ArrayEx]})
    numbers: ArrayEx<number>;
  }

  const example = new Example();
  example.numbers = new ArrayEx(12, 13, 15);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Example>(example);
  t.is(jsonData, '{"numbers":{"wrapper":[12,13,15]}}');

  const exampleParsed = objectMapper.parse<Example>(jsonData, {mainCreator: () => [Example]});
  t.assert(exampleParsed instanceof Example);
  t.deepEqual(exampleParsed, example);
});