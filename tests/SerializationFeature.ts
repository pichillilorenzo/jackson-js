import test from 'ava';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonClass} from '../src/decorators/JsonClass';
import {JacksonError} from '../src/core/JacksonError';
import {JsonIncludeType} from "../src/decorators/JsonInclude";

test('SerializationFeature.SORT_PROPERTIES_ALPHABETICALLY set to true', t => {
  class Book {
    @JsonProperty()
    name: string;
    @JsonProperty()
    category: string;
    @JsonProperty()
    id: number;

    constructor(id: number, name: string, category: string) {
      this.id = id;
      this.name = name;
      this.category = category;
    }
  }

  class Writer {
    @JsonProperty()
    @JsonClass({class: () => [Map, [String, Book]]})
    bookMap: Map<string, Book> = new Map<string, Book>();
    @JsonProperty()
    name: string;
    @JsonProperty()
    id: number;

    constructor(id: number, name: string) {
      this.id = id;
      this.name = name;
    }
  }

  const book1 = new Book(42, 'Learning TypeScript', 'Web Development');
  const book2 = new Book(21, 'Learning Spring', 'Java');
  const writer = new Writer(1, 'John');
  writer.bookMap.set('book 2', book2);
  writer.bookMap.set('book 1', book1);

  const objectMapper = new ObjectMapper();
  objectMapper.features.serialization.SORT_PROPERTIES_ALPHABETICALLY = true;

  const jsonData = objectMapper.stringify<Writer>(writer);
  // eslint-disable-next-line max-len
  t.is(jsonData, '{"bookMap":{"book 2":{"category":"Java","id":21,"name":"Learning Spring"},"book 1":{"category":"Web Development","id":42,"name":"Learning TypeScript"}},"id":1,"name":"John"}');
});

test('SerializationFeature.ORDER_MAP_AND_OBJECT_LITERAL_ENTRIES_BY_KEYS set to true', t => {
  class Book {
    @JsonProperty()
    name: string;
    @JsonProperty()
    category: string;
    @JsonProperty()
    id: number;

    constructor(id: number, name: string, category: string) {
      this.id = id;
      this.name = name;
      this.category = category;
    }
  }

  class Writer {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;
    @JsonProperty()
    @JsonClass({class: () => [Map, [String, Book]]})
    bookMap: Map<string, Book> = new Map<string, Book>();
    @JsonProperty()
    @JsonClass({class: () => [Object, [String, Book]]})
    bookObjLiteral: {[key: string]: Book} = {};

    constructor(id: number, name: string) {
      this.id = id;
      this.name = name;
    }
  }

  const book1 = new Book(42, 'Learning TypeScript', 'Web Development');
  const book2 = new Book(21, 'Learning Spring', 'Java');
  const writer = new Writer(1, 'John');
  writer.bookMap.set('map book 2', book2);
  writer.bookMap.set('map book 1', book1);
  writer.bookObjLiteral = {
    'obj literal book 2': book2,
    'obj literal book 1': book1
  };

  const objectMapper = new ObjectMapper();
  objectMapper.features.serialization.ORDER_MAP_AND_OBJECT_LITERAL_ENTRIES_BY_KEYS = true;

  const jsonData = objectMapper.stringify<Writer>(writer);
  // eslint-disable-next-line max-len
  t.assert(jsonData.includes(':{"map book 1":'));
  t.assert(jsonData.includes(',"map book 2":'));
  t.assert(jsonData.includes(':{"obj literal book 1":'));
  t.assert(jsonData.includes(',"obj literal book 2":'));
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"bookMap":{"map book 1":{"id":42,"name":"Learning TypeScript","category":"Web Development"},"map book 2":{"id":21,"name":"Learning Spring","category":"Java"}},"bookObjLiteral":{"obj literal book 1":{"id":42,"name":"Learning TypeScript","category":"Web Development"},"obj literal book 2":{"id":21,"name":"Learning Spring","category":"Java"}},"id":1,"name":"John"}'));
});

test('SerializationFeature.FAIL_ON_SELF_REFERENCES set to false', t => {
  const errFailOnSelfReferences = t.throws<JacksonError>(() => {
    class User {
      @JsonProperty()
      id: number;
      @JsonProperty()
      firstname: string;
      @JsonProperty()
      lastname: string;
      @JsonProperty()
      userRef: User;

      constructor(id: number, firstname: string, lastname: string) {
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
      }
    }

    const user = new User(1, 'John', 'Alfa');
    user.userRef = user;
    const objectMapper = new ObjectMapper();
    objectMapper.stringify<User>(user);
  });

  t.assert(errFailOnSelfReferences instanceof JacksonError);

  const errInfiniteRecursion = t.throws<Error>(() => {
    class User {
      @JsonProperty()
      id: number;
      @JsonProperty()
      firstname: string;
      @JsonProperty()
      lastname: string;
      @JsonProperty()
      userRef: User;

      constructor(id: number, firstname: string, lastname: string) {
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
      }
    }

    const user = new User(1, 'John', 'Alfa');
    user.userRef = user;
    const objectMapper = new ObjectMapper();
    objectMapper.features.serialization.FAIL_ON_SELF_REFERENCES = false;
    objectMapper.stringify<User>(user);
  });

  t.assert(errInfiniteRecursion instanceof Error);
});

test('SerializationFeature.WRITE_DATE_KEYS_AS_TIMESTAMPS set to true', t => {
  class Event {
    @JsonProperty()
    name: string;
    @JsonProperty()
    @JsonClass({class: () => [Map, [Date, String]]})
    infoMap: Map<Date, string> = new Map<Date, string>();
    @JsonProperty()
    @JsonClass({class: () => [Object, [Date, String]]})
    infoObjLiteral = {};

    constructor(name: string) {
      this.name = name;
    }
  }
  const eventDate = new Date(1586993967000);
  const event = new Event('Event 1');
  event.infoMap.set(eventDate, 'info map');
  // @ts-ignore
  event.infoObjLiteral[eventDate] = 'info obj literal';

  const objectMapper = new ObjectMapper();
  objectMapper.features.serialization.WRITE_DATE_KEYS_AS_TIMESTAMPS = true;

  const jsonData = objectMapper.stringify<Event>(event);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"infoMap":{"1586993967000":"info map"},"infoObjLiteral":{"1586993967000":"info obj literal"},"name":"Event 1"}'));
});

test('SerializationFeature.WRITE_SELF_REFERENCES_AS_NULL set to true', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;
    @JsonProperty()
    userRef: User;

    constructor(id: number, firstname: string, lastname: string) {
      this.id = id;
      this.firstname = firstname;
      this.lastname = lastname;
    }
  }

  const user = new User(1, 'John', 'Alfa');
  user.userRef = user;
  const objectMapper = new ObjectMapper();
  objectMapper.features.serialization.FAIL_ON_SELF_REFERENCES = false;
  objectMapper.features.serialization.WRITE_SELF_REFERENCES_AS_NULL = true;

  const jsonData = objectMapper.stringify<User>(user);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"firstname":"John","lastname":"Alfa","userRef":null}'));
});

test('SerializationFeature.DEFAULT_PROPERTY_INCLUSION set to JsonIncludeType.NON_EMPTY', t => {
  class Employee {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;
    @JsonProperty()
    dept: string;
    @JsonProperty()
    address: string;
    @JsonProperty()
    phones: string[];
    @JsonProperty()
    otherInfo: Map<string, string>;

    constructor(id: number, name: string, dept: string, address: string, phones: string[], otherInfo: Map<string, string>) {
      this.id = id;
      this.name = name;
      this.dept = dept;
      this.address = address;
      this.phones = phones;
      this.otherInfo = otherInfo;
    }
  }

  const employee = new Employee(0, 'John', '', null, [], new Map<string, string>());
  const objectMapper = new ObjectMapper();
  objectMapper.features.serialization.DEFAULT_PROPERTY_INCLUSION = JsonIncludeType.NON_EMPTY;

  const jsonData = objectMapper.stringify<Employee>(employee);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":0,"name":"John"}'));
});
