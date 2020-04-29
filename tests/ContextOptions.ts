import test from 'ava';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonClassType} from '../src/decorators/JsonClassType';
import {JsonIgnore} from '../src/decorators/JsonIgnore';
import {JsonFormat, JsonFormatShape} from '../src/decorators/JsonFormat';
import {JsonView} from '../src/decorators/JsonView';
import {
  ClassType,
  JsonParserForTypeContext, JsonParserTransformerContext,
  JsonStringifierForTypeContext,
  JsonStringifierTransformerContext
} from '../src/@types';

test('decoratorsEnabled context option', t => {
  class User {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    email: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    @JsonIgnore()
    firstname: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    @JsonIgnore()
    lastname: string;
    @JsonProperty()
    @JsonFormat({
      shape: JsonFormatShape.STRING,
      pattern: 'YYYY-MM-DD hh:mm:ss',
    })
    @JsonClassType({type: () => [Date]})
    birthday: Date;

    // eslint-disable-next-line no-shadow
    constructor(id: number, email: string, firstname: string, lastname: string, birthday: Date) {
      this.id = id;
      this.email = email;
      this.firstname = firstname;
      this.lastname = lastname;
      this.birthday = birthday;
    }
  }

  const birthday = new Date(1994, 11, 14);
  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa', birthday);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user, {
    decoratorsEnabled: {
      JsonIgnore: false,
      JsonFormat: false
    }
  });
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa","birthday":787359600000}'));

  // eslint-disable-next-line max-len
  const userParsed = objectMapper.parse<User>('{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa","birthday":787359600000}', {
    mainCreator: () => [User],
    decoratorsEnabled: {
      JsonIgnore: false
    }
  });
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, 'john.alfa@gmail.com');
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.deepEqual(userParsed.birthday, birthday);
});

test('forType context option', t => {
  class Views {
    static public = class Public {};
    static internal = class Internal {};
  }

  class Book {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    @JsonView({value: () => [Views.internal]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty()
    @JsonIgnore()
    @JsonClassType({type: () => [Date]})
    date: Date;

    // eslint-disable-next-line no-shadow
    constructor(id: number, name: string, date: Date) {
      this.id = id;
      this.name = name;
      this.date = date;
    }
  }

  class Writer {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    @JsonView({value: () => [Views.internal]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty()
    @JsonClassType({type: () => [Array, [Book]]})
    books: Book[] = [];
    @JsonProperty()
    @JsonIgnore()
    @JsonClassType({type: () => [Date]})
    birthday: Date;

    // eslint-disable-next-line no-shadow
    constructor(id: number, name: string, birthday: Date) {
      this.id = id;
      this.name = name;
      this.birthday = birthday;
    }
  }

  const birthday = new Date(1994, 11, 14);
  const writer = new Writer(1, 'George R. R. Martin', birthday);
  const bookDate = new Date(2012, 11, 4);
  const book = new Book(1, 'Game Of Thrones', bookDate);
  writer.books.push(book);

  const objectMapper = new ObjectMapper();

  const stringifierForTypeContext = new Map<ClassType<any>, JsonStringifierForTypeContext>();
  stringifierForTypeContext.set(Book, {
    withViews: () => [Views.public, Views.internal],
    decoratorsEnabled: {
      JsonIgnore: false
    },
    serializers: [
      {
        type: () => Date,
        order: 0,
        mapper: (key, value: Date, context: JsonStringifierTransformerContext) => ({
          dateWrapper: value.getTime()
        })
      }
    ]
  });

  const jsonData = objectMapper.stringify<Writer>(writer, {
    withViews: () => [Views.public],
    forType: stringifierForTypeContext,
    serializers: [
      {
        type: () => Date,
        order: 0,
        mapper: (key, value: Date, context: JsonStringifierTransformerContext) => value
      }
    ]
  });
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"books":[{"id":1,"name":"Game Of Thrones","date":{"dateWrapper":1354575600000}}],"name":"George R. R. Martin"}'));

  const parserForTypeContext = new Map<ClassType<any>, JsonParserForTypeContext>();
  parserForTypeContext.set(Book, {
    withViews: () => [Views.public, Views.internal],
    decoratorsEnabled: {
      JsonIgnore: false
    },
    deserializers: [
      {
        type: () => Date,
        order: 0,
        mapper: (key, value: {dateWrapper: number}, context: JsonParserTransformerContext) => new Date(value.dateWrapper)
      }
    ]
  });

  // eslint-disable-next-line max-len
  const writerParsed = objectMapper.parse<Writer>('{"books":[{"id":1,"name":"Game Of Thrones","date":{"dateWrapper":1354575600000}}],"id":1,"name":"George R. R. Martin","birthday":787359600000}', {
    mainCreator: () => [Writer],
    withViews: () => [Views.public],
    forType: parserForTypeContext,
    deserializers: [
      {
        type: () => Date,
        order: 0,
        mapper: (key, value: any, context: JsonParserTransformerContext) => value
      }
    ]
  });
  t.assert(writerParsed instanceof Writer);
  t.is(writerParsed.id, null);
  t.is(writerParsed.name, 'George R. R. Martin');
  t.is(writerParsed.birthday, null);
  t.is(writerParsed.books.length, 1);
  t.assert(writerParsed.books[0] instanceof Book);
  t.is(writerParsed.books[0].id, 1);
  t.is(writerParsed.books[0].name, 'Game Of Thrones');
  t.deepEqual(writerParsed.books[0].date, bookDate);
});
