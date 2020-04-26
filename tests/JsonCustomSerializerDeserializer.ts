import test from 'ava';
import {JsonSerialize} from '../src/decorators/JsonSerialize';
import {JsonDeserialize} from '../src/decorators/JsonDeserialize';
import {JsonClassType} from '../src/decorators/JsonClassType';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';

test('@JsonSerialize and @JsonDeserialize at class level', t => {
  // eslint-disable-next-line no-shadow
  @JsonSerialize({using: (user: User, context) => ({
    otherInfo: 'other info',
    ...user
  })})
  // eslint-disable-next-line no-shadow
  @JsonDeserialize({using: (user: any, context) => {
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

test('@JsonSerialize and @JsonDeserialize at property level', t => {
  const customBookListSerializer = (books: Book[], context) =>
    // eslint-disable-next-line no-shadow
    books.map((book) => new Book(book.id, book.name, book.date, null));

  class DateSerializer {
    static serializeDate(date, context): any {
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        formatted: date.toLocaleDateString()
      };
    }
    static deserializeDate(dateObj, context): Date {
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
    @JsonClassType({type: () => [Date]})
    date: Date;

    @JsonProperty()
    @JsonClassType({type: () => [Writer]})
    writer: Writer;

    // eslint-disable-next-line no-shadow
    constructor(id: number, name: string, date: Date, @JsonClassType({type: () => [Writer]}) writer: Writer) {
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
    @JsonClassType({type: () => [Array, [Book]]})
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
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"name":"George R. R. Martin","books":[{"id":1,"name":"Game Of Thrones","writer":null,"date":{"year":2012,"month":12,"day":4,"formatted":"12/4/2012"}}]}'));

  const writerParsed = objectMapper.parse<Writer>(jsonData, {mainCreator: () => [Writer]});
  t.assert(writerParsed instanceof Writer);
  t.assert(writerParsed.books.length === 1);
  t.assert(writerParsed.books[0] instanceof Book);
  t.assert(writerParsed.books[0].date instanceof Date);
});

test('@JsonSerialize and @JsonDeserialize at method level', t => {
  const customBookListSerializer = (books: Book[], context) =>
    // eslint-disable-next-line no-shadow
    books.map((book) => {
      const bookWithoutWriter = new Book();
      bookWithoutWriter.id = book.id;
      bookWithoutWriter.name = book.name;
      bookWithoutWriter.date = book.date;
      bookWithoutWriter.writer = null;
      return bookWithoutWriter;
    });

  class DateSerializer {
    static serializeDate(date, context): any {
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        formatted: date.toLocaleDateString()
      };
    }
    static deserializeDate(dateObj, context): Date {
      return new Date(dateObj.formatted);
    }
  }

  class Book {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;

    @JsonProperty()
    @JsonClassType({type: () => [Date]})
    date: Date;

    @JsonProperty()
    @JsonClassType({type: () => [Writer]})
    writer: Writer;

    @JsonProperty()
    @JsonSerialize({using: DateSerializer.serializeDate})
    @JsonClassType({type: () => [Date]})
    getDate(): Date {
      return this.date;
    }

    @JsonProperty()
    @JsonDeserialize({using: DateSerializer.deserializeDate})
    setDate(@JsonClassType({type: () => [Date]}) date: Date) {
      this.date = date;
    }
  }

  class Writer {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;

    @JsonProperty()
    @JsonClassType({type: () => [Array, [Book]]})
    books: Book[] = [];

    constructor(id: number, name: string) {
      this.id = id;
      this.name = name;
    }

    @JsonProperty()
    @JsonClassType({type: () => [Array, [Book]]})
    @JsonSerialize({using: customBookListSerializer})
    getBooks(): Book[] {
      return this.books;
    }
  }

  const writer = new Writer(1, 'George R. R. Martin');
  const book = new Book();
  book.id = 1;
  book.name = 'Game Of Thrones';
  book.date = new Date(2012, 11, 4);
  book.writer = writer;
  writer.books.push(book);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Writer>(writer);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"name":"George R. R. Martin","books":[{"id":1,"name":"Game Of Thrones","writer":null,"date":{"year":2012,"month":12,"day":4,"formatted":"12/4/2012"}}]}'));

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
    @JsonClassType({type: () => [Person]})
    ceo: Person;

    constructor(name: string,
      @JsonDeserialize({using: (person: any, context) => {
        delete person.otherInfo;
        return person;
        // eslint-disable-next-line no-shadow
      }}) @JsonClassType({type: () => [Person]}) ceo: Person) {
      this.name = name;
      this.ceo = ceo;
    }

  }

  @JsonSerialize({using: (person: Person, context) => ({
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
    @JsonClassType({type: () => [Date]})
    date: Date;

    @JsonProperty()
    @JsonClassType({type: () => [Writer]})
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
    @JsonClassType({type: () => [Array, [Book]]})
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
    mapper: (key, value: Book, context) => {
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
    mapper: (key, value: any, context) => {
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

test('@JsonSerialize and @JsonDeserialize at property level with contentUsing and keyUsing option values', t => {
  class Book {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;
    @JsonProperty()
    @JsonClassType({type: () => [Date]})
    date: Date;

    @JsonProperty()
    @JsonClassType({type: () => [Writer]})
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
    @JsonClassType({type: () => [Array, [Book]]})
    @JsonSerialize({
      // eslint-disable-next-line no-shadow
      contentUsing: (book: Book, context) => {
        // @ts-ignore
        book.writerName = book.writer.name;
        book.writer = null;
        return book;
      }
    })
    @JsonDeserialize({
      // eslint-disable-next-line no-shadow
      contentUsing: (book: any, context) => {
        delete book.writerName;
        return book;
      }
    })
    books: Book[] = [];

    @JsonProperty()
    @JsonClassType({type: () => [Map]})
    @JsonSerialize({
      keyUsing: (key: string, context) => 'newMapKey-' + key,
      contentUsing: (obj: string, context) => 'newMapValue: ' + obj
    })
    @JsonDeserialize({
      keyUsing: (key: string, context) => key.replace('newMapKey-', ''),
      contentUsing: (obj: string, context) => obj.replace('newMapValue: ', '')
    })
    otherInfoMap: Map<string, string> = new Map();

    @JsonProperty()
    @JsonSerialize({
      keyUsing: (key: string, context) => 'newObjKey-' + key,
      contentUsing: (obj: string, context) => 'newObjValue: ' + obj
    })
    @JsonDeserialize({
      keyUsing: (key: string, context) => key.replace('newObjKey-', ''),
      contentUsing: (obj: string, context) => obj.replace('newObjValue: ', '')
    })
    otherInfoObjLiteral: {phone?: string; address?: string} = {};

    constructor(id: number, name: string) {
      this.id = id;
      this.name = name;
    }
  }

  const writer = new Writer(1, 'George R. R. Martin');
  writer.otherInfoMap.set('phone', '+393333111999');
  writer.otherInfoMap.set('address', '123 Main Street, New York, NY 10030');
  writer.otherInfoObjLiteral = {
    address: '123 Main Street, New York, NY 10030',
    phone: '+393333111999'
  };

  const book = new Book(1, 'Game Of Thrones', new Date(2012, 11, 4), writer);
  writer.books.push(book);

  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<Writer>(writer);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"books":[{"id":1,"name":"Game Of Thrones","date":1354575600000,"writer":null,"writerName":"George R. R. Martin"}],"otherInfoMap":{"newMapKey-phone":"newMapValue: +393333111999","newMapKey-address":"newMapValue: 123 Main Street, New York, NY 10030"},"otherInfoObjLiteral":{"newObjKey-address":"newObjValue: 123 Main Street, New York, NY 10030","newObjKey-phone":"newObjValue: +393333111999"},"id":1,"name":"George R. R. Martin"}'));

  const writerParsed = objectMapper.parse<Writer>(jsonData, {mainCreator: () => [Writer]});
  t.assert(writerParsed instanceof Writer);
  t.is(writerParsed.id, 1);
  t.is(writerParsed.name, 'George R. R. Martin');
  t.assert(writerParsed.otherInfoMap instanceof Map);
  t.is(writerParsed.otherInfoMap.get('phone'), '+393333111999');
  t.is(writerParsed.otherInfoMap.get('address'), '123 Main Street, New York, NY 10030');
  t.is(writerParsed.otherInfoObjLiteral.phone, '+393333111999');
  t.is(writerParsed.otherInfoObjLiteral.address, '123 Main Street, New York, NY 10030');
  t.assert(writerParsed.books.length === 1);
  t.assert(writerParsed.books[0] instanceof Book);
  t.assert(writerParsed.books[0].date instanceof Date);
  t.is(writerParsed.books[0].id, 1);
  t.is(writerParsed.books[0].name, 'Game Of Thrones');
  t.deepEqual(writerParsed.books[0].date, new Date(2012, 11, 4));
  t.is(writerParsed.books[0].writer, null);
});
