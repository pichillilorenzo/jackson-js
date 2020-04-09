import test from 'ava';
import {JsonSerialize} from '../src/decorators/JsonSerialize';
import {JsonDeserialize} from '../src/decorators/JsonDeserialize';
import {JsonClass} from '../src/decorators/JsonClass';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';

test('@JsonSerialize and @JsonDeserialize on class', t => {
  // eslint-disable-next-line no-shadow
  @JsonSerialize({using: (user: User) => ({
    otherInfo: 'other info',
    ...user
  })})
  // eslint-disable-next-line no-shadow
  @JsonDeserialize({using: (user: any) => {
    delete user.otherInfo;
    return user;
  }})
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    email: string;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;

    constructor(id: number, email: string, firstname: string, lastname: string) {
      this.id = id;
      this.email = email;
      this.firstname = firstname;
      this.lastname = lastname;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"otherInfo":"other info","id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, 'john.alfa@gmail.com');
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.assert(!Object.hasOwnProperty.call(userParsed, 'otherInfo'));
});

test('@JsonSerialize and @JsonDeserialize on properties', t => {
  const customBookListSerializer = (books: Book[]) =>
    // eslint-disable-next-line no-shadow
    books.map((book) => new Book(book.id, book.name, book.date, null));

  class DateSerializer {
    static serializeDate(date): any {
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        formatted: date.toLocaleDateString()
      };
    }
    static deserializeDate(dateObj): Date {
      return new Date(dateObj.formatted);
    }
  }

  class Book {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;

    @JsonProperty()
    @JsonSerialize({using: DateSerializer.serializeDate})
    @JsonDeserialize({using: DateSerializer.deserializeDate})
    @JsonClass({class: () => [Date]})
    date: Date;

    @JsonProperty()
    @JsonClass({class: () => [Writer]})
    writer: Writer;

    // eslint-disable-next-line no-shadow
    constructor(id: number, name: string, date: Date, @JsonClass({class: () => [Writer]}) writer: Writer) {
      this.id = id;
      this.name = name;
      this.date = date;
      this.writer = writer;
    }
  }

  class Writer {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;

    @JsonProperty()
    @JsonClass({class: () => [Array, [Book]]})
    @JsonSerialize({using: customBookListSerializer})
    books: Book[] = [];

    constructor(id: number, name: string) {
      this.id = id;
      this.name = name;
    }
  }

  const writer = new Writer(1, 'George R. R. Martin');
  const book = new Book(1, 'Game Of Thrones', new Date(2012, 11, 4), writer);
  writer.books.push(book);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Writer>(writer);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"books":[{"id":1,"name":"Game Of Thrones","date":{"year":2012,"month":12,"day":4,"formatted":"12/4/2012"},"writer":null}],"id":1,"name":"George R. R. Martin"}'));

  const writerParsed = objectMapper.parse<Writer>(jsonData, {mainCreator: () => [Writer]});
  t.assert(writerParsed instanceof Writer);
  t.assert(writerParsed.books.length === 1);
  t.assert(writerParsed.books[0] instanceof Book);
  t.assert(writerParsed.books[0].date instanceof Date);
});

test('@JsonDeserialize at parameter level', t => {
  class Company {
    @JsonProperty()
    name: string;

    @JsonProperty()
    @JsonClass({class: () => [Person]})
    ceo: Person;

    constructor(name: string,
      @JsonDeserialize({using: (person: any) => {
        delete person.otherInfo;
        return person;
        // eslint-disable-next-line no-shadow
      }}) @JsonClass({class: () => [Person]}) ceo: Person) {
      this.name = name;
      this.ceo = ceo;
    }

  }

  @JsonSerialize({using: (person: Person) => ({
    otherInfo: 'other info',
    ...person
  })})
  class Person {
    @JsonProperty()
    id: number;
    @JsonProperty()
    email: string;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;

    constructor(id: number, email: string, firstname: string, lastname: string) {
      this.id = id;
      this.email = email;
      this.firstname = firstname;
      this.lastname = lastname;
    }
  }

  const ceo = new Person(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const company = new Company('Google', ceo);

  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<Company>(company);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"name":"Google","ceo":{"otherInfo":"other info","id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}}'));

  const companyParsed = objectMapper.parse<Company>(jsonData, {mainCreator: () => [Company]});
  t.assert(companyParsed instanceof Company);
  t.is(companyParsed.name, 'Google');
  t.assert(companyParsed.ceo instanceof Person);
  t.is(companyParsed.ceo.id, 1);
  t.is(companyParsed.ceo.email, 'john.alfa@gmail.com');
  t.is(companyParsed.ceo.firstname, 'John');
  t.is(companyParsed.ceo.lastname, 'Alfa');
  t.assert(!Object.hasOwnProperty.call(companyParsed.ceo, 'otherInfo'));
});

test('ObjectMapper.serializers and ObjectMapper.deserializers', t => {
  class Book {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;
    @JsonProperty()
    @JsonClass({class: () => [Date]})
    date: Date;

    @JsonProperty()
    @JsonClass({class: () => [Writer]})
    writer: Writer;

    // eslint-disable-next-line no-shadow
    constructor(id: number, name: string, date: Date, writer: Writer) {
      this.id = id;
      this.name = name;
      this.date = date;
      this.writer = writer;
    }
  }

  class Writer {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;

    @JsonProperty()
    @JsonClass({class: () => [Array, [Book]]})
    books: Book[] = [];

    constructor(id: number, name: string) {
      this.id = id;
      this.name = name;
    }
  }

  const writer = new Writer(1, 'George R. R. Martin');
  const book = new Book(1, 'Game Of Thrones', new Date(2012, 11, 4), writer);
  writer.books.push(book);
  writer.books.push(null);
  writer.books.push(null);

  const objectMapper = new ObjectMapper();
  objectMapper.serializers.push({
    mapper: (key, value: Book) => {
      if (value != null) {
        return {
          id: value.id,
          name: value.name,
          date: {
            year: value.date.getFullYear(),
            month: value.date.getMonth() + 1,
            day: value.date.getDate(),
            formatted: value.date.toLocaleDateString()
          },
          writer: null
        };
      }
      return value;
    },
    type: () => Book
  });

  objectMapper.deserializers.push({
    mapper: (key, value: any) => {
      if (value != null) {
        return new Book(value.id, value.name, new Date(value.date.formatted), value.writer);
      }
      return value;
    },
    type: () => Book
  });

  const jsonData = objectMapper.stringify<Writer>(writer);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"books":[{"id":1,"name":"Game Of Thrones","date":{"year":2012,"month":12,"day":4,"formatted":"12/4/2012"},"writer":null},null,null],"id":1,"name":"George R. R. Martin"}'));

  const writerParsed = objectMapper.parse<Writer>(jsonData, {mainCreator: () => [Writer]});
  t.assert(writerParsed instanceof Writer);
  t.assert(writerParsed.books.length === 3);
  t.assert(writerParsed.books[0] instanceof Book);
  t.assert(writerParsed.books[0].date instanceof Date);
  t.assert(writerParsed.books[1] === null);
  t.assert(writerParsed.books[2] === null);
});
