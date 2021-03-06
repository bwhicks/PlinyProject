import * as React from "react";
import axios from "axios";
import { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";

import Header from "../components/Header";
import PeopleFilter from "../components/PeopleFilter";
import getBaseUrl from "./util";
import { ParsedUrlQuery } from "querystring";

interface Person {
  pk: number;
  nomina: string;
  ordo: string;
  letters_to: Array<string>;
  url: URL;
}

interface CorrespondentListProps {
  correspondents: Array<Person>;
  count: number;
}

interface PaginationProps {
  query: ParsedUrlQuery;
  count: number;
  page: number;
  pages: Array<number>;
}

interface PeopleListProps extends CorrespondentListProps, PaginationProps {}

function queryMapToString(query: ParsedUrlQuery) {
  const queryArray = [];
  if (query) {
    for (let prop in query) {
      if (Array.isArray(query[prop])) {
        //@ts-ignore
        query[prop].forEach((el) => {
          queryArray.push(`${prop}=${el}`);
        });
      } else {
        queryArray.push(`${prop}=${query[prop]}`);
      }
    }

    if (queryArray.length > 0) {
      return `?${queryArray.join("&")}`;
    }
  }

  return "";
}

class Pagination extends React.Component<PaginationProps> {
  constructor(props: PaginationProps) {
    super(props);
  }

  render() {
    return (
      <nav aria-label="pagination navigation">
        <ul className="pagination">
          {this.props.pages.map((el) => {
            if (el == this.props.page) {
              return (
                <li key={el}>
                  <a
                    href="#"
                    className="disabled"
                    aria-label={`${el} is current page`}
                    tabIndex={-1}
                  >
                    {el}
                  </a>
                </li>
              );
            }
            this.props.query.page = el.toString();
            const queryString = queryMapToString(this.props.query);
            return (
              <li key={el}>
                <Link href={`/people${queryString}`}>
                  <a aria-label={`Link to page ${el}`}>{el}</a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }
}

const CorrespondentList: React.FC<CorrespondentListProps> = ({
  correspondents,
  count,
}) => {
  if (!count) {
    return (
      <div className="responsive-table">
        <h2>No correspondents.</h2>
      </div>
    );
  } else {
    return (
      <div className="responsive-table">
        <h2>{`${count} ${count > 1 ? "correspondents" : "correspondent"}.`}</h2>
        <table>
          <caption>Results</caption>
          <thead>
            <tr>
              <th>Nomina</th>
              <th>Ordo (Social Class)</th>
              <th>Letters To</th>
            </tr>
          </thead>
          <tbody>
            {correspondents.map((el) => (
              <tr
                key={`${el.pk}_${el.nomina.split(" ").join("_").toLowerCase()}`}
              >
                <td>
                  <Link href={`/people-detail?id=${el.pk}`} as={el.url}>
                    <a>{el.nomina}</a>
                  </Link>
                </td>
                <td>{el.ordo}</td>
                <td>{el.letters_to.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
};

const PeopleList: NextPage<PeopleListProps> = ({
  correspondents,
  count,
  page,
  pages,
  query,
}) => (
  <React.Fragment>
    <Head>
      <title>Pliny's Correspondents</title>
    </Head>
    <Header />
    <main>
      <h1>Pliny's Correspondents</h1>
      <p>
        Below is a list of Pliny's correspondents. You may use the form below to
        filter the results by nomina or social class. 'Citizen' denotes those
        correspondents for whom their only status was citizenship (as compared
        to the more exclusive equestrian or senatorial orders). To search for a
        particular nomina, simply hit the <code>Enter</code> key after typing a
        name.
      </p>
      <PeopleFilter key={queryMapToString(query)} query={query} />
      <Pagination count={count} pages={pages} page={page} query={query} />
      <CorrespondentList correspondents={correspondents} count={count} />
    </main>
  </React.Fragment>
);

PeopleList.getInitialProps = async ({
  query,
  req,
}: any): Promise<PeopleListProps> => {
  try {
    const queryString = queryMapToString(query);
    const baseUrl = getBaseUrl(req);
    const res = await axios.get(baseUrl + `/api/people${queryString}`);
    const pages = [...Array(Math.ceil(res.data.count / 20)).keys()].map(
      (x) => x + 1
    );
    if (pages.length === 1) {
      pages.shift();
    }
    return {
      correspondents: res.data.results,
      count: res.data.count,
      page: query.page ? query.page : 1,
      pages: pages,
      query: query,
    };
  } catch (err) {
    return {
      correspondents: [],
      count: 0,
      page: query.page ? query.page : 1,
      pages: [1],
      query: query,
    };
  }
};

export default PeopleList;
