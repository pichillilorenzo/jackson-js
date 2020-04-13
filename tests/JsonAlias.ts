import test from 'ava';
import {JsonAlias} from '../src/decorators/JsonAlias';
import {JsonClass} from '../src/decorators/JsonClass';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonSetter} from "../src/decorators/JsonSetter";

test('@JsonAlias at property level', t => {
  class Book {
    @JsonProperty()
    name: string;

    @JsonProperty()
    @JsonAlias({values: ['bkcat', 'mybkcat']})
    category: string;

    constructor(name: string, category: string) {
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
    @JsonClass({class: () => [Array, [Book]]})
    books: Book[] = [];

    constructor(id: number, name: string, @JsonClass({class: () => [Array, [Book]]}) books: Book[]) {
      this.id = id;
      this.name = name;
      this.books = books;
    }
  }

  const objectMapper = new ObjectMapper();
  // eslint-disable-next-line max-len
  const jsonData = '{"id":1,"name":"John","books":[{"name":"Learning TypeScript","bkcat":"Web Development"},{"name":"Learning Spring","mybkcat":"Java"}]}';

  const writer = objectMapper.parse<Writer>(jsonData, {mainCreator: () => [Writer]});
  t.assert(writer instanceof Writer);
  t.not(writer.books, null);
  t.is(writer.books.length, 2);
  t.is(writer.books[0].category, 'Web Development');
  // @ts-ignore
  t.is(writer.books[0].bkcat, undefined);
  t.is(writer.books[1].category, 'Java');
  // @ts-ignore
  t.is(writer.books[1].mybkcat, undefined);
});

test('@JsonAlias at method level', t => {
  class Book {
    @JsonProperty()
    name: string;

    @JsonProperty()
    category: string;

    constructor(name: string, category: string) {
      this.name = name;
      this.category = category;
    }

    @JsonAlias({values: ['bkcat', 'mybkcat']})
    @JsonSetter()
    setCategory(category: string) {
      this.category = category;
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

    constructor(id: number, name: string, @JsonClass({class: () => [Array, [Book]]}) books: Book[]) {
      this.id = id;
      this.name = name;
      this.books = books;
    }
  }

  const objectMapper = new ObjectMapper();
  // eslint-disable-next-line max-len
  const jsonData = '{"id":1,"name":"John","books":[{"name":"Learning TypeScript","bkcat":"Web Development"},{"name":"Learning Spring","mybkcat":"Java"}]}';

  const writer = objectMapper.parse<Writer>(jsonData, {mainCreator: () => [Writer]});
  t.assert(writer instanceof Writer);
  t.not(writer.books, null);
  t.is(writer.books.length, 2);
  t.is(writer.books[0].category, 'Web Development');
  // @ts-ignore
  t.is(writer.books[0].bkcat, undefined);
  t.is(writer.books[1].category, 'Java');
  // @ts-ignore
  t.is(writer.books[1].mybkcat, undefined);
});

test('@JsonAlias at parameter level', t => {
  class Book {
    @JsonProperty()
    name: string;
    @JsonProperty()
    category: string;

    constructor(name: string, @JsonAlias({values: ['bkcat', 'mybkcat']}) category: string) {
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
    @JsonClass({class: () => [Array, [Book]]})
    books: Book[] = [];

    constructor(id: number, name: string, @JsonClass({class: () => [Array, [Book]]}) books: Book[]) {
      this.id = id;
      this.name = name;
      this.books = books;
    }
  }

  const objectMapper = new ObjectMapper();
  // eslint-disable-next-line max-len
  const jsonData = '{"id":1,"name":"John","books":[{"name":"Learning TypeScript","bkcat":"Web Development"},{"name":"Learning Spring","mybkcat":"Java"}]}';

  const writer = objectMapper.parse<Writer>(jsonData, {mainCreator: () => [Writer]});
  t.assert(writer instanceof Writer);
  t.not(writer.books, null);
  t.is(writer.books.length, 2);
  t.is(writer.books[0].category, 'Web Development');
  // @ts-ignore
  t.is(writer.books[0].bkcat, undefined);
  t.is(writer.books[1].category, 'Java');
  // @ts-ignore
  t.is(writer.books[1].mybkcat, undefined);
});
