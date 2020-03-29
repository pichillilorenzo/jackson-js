import test from 'ava';
import {JsonClass, JsonDeserialize, JsonSerialize, ObjectMapper} from '../src';

test('@JsonSerialize and @JsonDeserialize on class', t => {
  @JsonSerialize({using: (user: User) => ({
    otherInfo: 'other info',
    ...user
  })})
  @JsonDeserialize({using: (user: any) => {
    delete user.otherInfo;
    return user;
  }})
  class User {
    id: number;
    email: string;
    firstname: string;
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
  t.assert(jsonData.includes('1'));
  t.assert(jsonData.includes('john.alfa@gmail.com'));
  t.assert(jsonData.includes('John'));
  t.assert(jsonData.includes('Alfa'));
  t.assert(jsonData.includes('otherInfo'));
  t.assert(jsonData.includes('other info'));

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
    id: number;
    name: string;

    @JsonSerialize({using: DateSerializer.serializeDate})
    @JsonDeserialize({using: DateSerializer.deserializeDate})
    @JsonClass({class: () => [Date]})
    date: Date;

    @JsonClass({class: () => [Writer]})
    writer: Writer;

    constructor(id: number, name: string, date: Date, writer: Writer) {
      this.id = id;
      this.name = name;
      this.date = date;
      this.writer = writer;
    }
  }

  class Writer {
    id: number;
    name: string;

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
  t.assert(jsonData.includes('George R. R. Martin'));
  t.assert(jsonData.includes('Game Of Thrones'));
  t.assert(jsonData.includes('2012'));
  t.assert(jsonData.includes('formatted'));
  t.assert(jsonData.includes('null'));

  const writerParsed = objectMapper.parse<Writer>(jsonData, {mainCreator: () => [Writer]});
  t.assert(writerParsed instanceof Writer);
  t.assert(writerParsed.books.length === 1);
  t.assert(writerParsed.books[0] instanceof Book);
  t.assert(writerParsed.books[0].date instanceof Date);
});

test('ObjectMapper.serializers and ObjectMapper.deserializers', t => {
  class Book {
    id: number;
    name: string;
    @JsonClass({class: () => [Date]})
    date: Date;

    @JsonClass({class: () => [Writer]})
    writer: Writer;

    constructor(id: number, name: string, date: Date, writer: Writer) {
      this.id = id;
      this.name = name;
      this.date = date;
      this.writer = writer;
    }
  }

  class Writer {
    id: number;
    name: string;

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

  t.assert(jsonData.includes('George R. R. Martin'));
  t.assert(jsonData.includes('Game Of Thrones'));
  t.assert(jsonData.includes('2012'));
  t.assert(jsonData.includes('formatted'));
  t.assert((jsonData.split('null').length - 1) === 3);

  const writerParsed = objectMapper.parse<Writer>(jsonData, {mainCreator: () => [Writer]});
  t.assert(writerParsed instanceof Writer);
  t.assert(writerParsed.books.length === 3);
  t.assert(writerParsed.books[0] instanceof Book);
  t.assert(writerParsed.books[0].date instanceof Date);
  t.assert(writerParsed.books[1] === null);
  t.assert(writerParsed.books[2] === null);
});
