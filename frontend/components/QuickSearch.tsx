import * as React from "react";
import Router from "next/router";
import axios from "axios";

interface InputProps {
  placeholder?: string;
  name: string;
  id: string;
  action?: string;
  method?: string;
  label: string;
}

interface InputState {
  value: string;
  expanded: boolean;
  options: Array<string>;
  filteredOptions: Array<string>;
  focusedOption?: number;
}

export default class QuickSearch extends React.Component<
  InputProps,
  InputState
> {
  form: React.RefObject<HTMLFormElement>;

  constructor(props: InputProps) {
    super(props);
    this.form = React.createRef();
    this.state = {
      value: "",
      expanded: false,
      options: [],
      filteredOptions: [],
      focusedOption: undefined,
    };
  }

  async componentDidMount() {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/people/autocomplete`
      );
      const nomina: Array<string> = res.data.map((x: any) => x.nomina).sort();
      this.setState({ options: nomina, filteredOptions: nomina });
    } catch (err) {
      this.setState({ options: [] });
    }

    document.addEventListener("click", this.handleClick);
  }

  handleClick = (event: MouseEvent): void => {
    if (
      this.form.current &&
      !this.form.current.contains(event.target as Node)
    ) {
      this.setState({ focusedOption: undefined, expanded: false });
    }
  };

  filterOptions = (value: string): void => {
    this.setState({
      filteredOptions: this.state.options.filter((nomina) => {
        const namesArray = nomina.split(" ");
        for (let name of namesArray) {
          if (name.toLowerCase().startsWith(value.toLowerCase())) {
            return true;
          }
        }
      }),
      focusedOption: undefined,
    });
  };

  setScroll = (): void => {
    const id = `${this.props.id}_choice_${this.state.focusedOption}`;
    const li = document.getElementById(id);
    if (li) {
      li.scrollIntoView();
    }
  };

  handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "ArrowDown") {
      let next = 0;
      if (this.state.focusedOption !== undefined) {
        next = this.state.focusedOption + 1;
      }
      if (next <= this.state.filteredOptions.length - 1) {
        this.setState({ focusedOption: next }, this.setScroll);
      } else {
        this.setState({ focusedOption: 0 }, this.setScroll);
      }
    }

    if (event.key === "ArrowUp") {
      if (!this.state.focusedOption) {
        this.setState(
          { focusedOption: this.state.filteredOptions.length - 1 },
          this.setScroll
        );
      } else {
        this.setState(
          { focusedOption: this.state.focusedOption - 1 },
          this.setScroll
        );
      }
    }

    if (event.key === "Enter") {
      if (this.state.expanded) {
        const target = event.target as HTMLInputElement;
        this.setState({
          value:
            this.state.filteredOptions[this.state.focusedOption!] ||
            target.value,
          expanded: false,
        });
      }
    }

    if (event.key === "Escape") {
      this.setState({
        value: "",
        expanded: false,
      });
    }
  };

  handleSubmit = (event?: React.FormEvent<HTMLFormElement>): void => {
    if (event) {
      event.preventDefault();
    }
    Router.push(`${this.props.action}?nomina=${this.state.value}`);
  };

  handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();
    this.setState({ value: event.target.value });
    this.filterOptions(event.target.value);
    if (
      event.target.value.length === 0 ||
      this.state.filteredOptions.length === 0
    ) {
      this.setState({ expanded: false });
    } else {
      this.setState({ expanded: true });
    }
  };

  handleFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
    if (event.target.value.length !== 0) {
      this.setState({ expanded: true });
    }
  };

  clickChoice = (event: React.MouseEvent<HTMLLIElement, MouseEvent>): void => {
    const target = event.target as HTMLLIElement;
    this.setState({ expanded: false, value: target.textContent || "" }, () => {
      if (this.form.current) {
        this.handleSubmit();
      }
    });
  };

  render() {
    return (
      <form
        action={this.props.action}
        method={this.props.method}
        ref={this.form}
        onSubmit={this.handleSubmit}
      >
        <label id={`label_${this.props.id}`} htmlFor={this.props.id}>
          {this.props.label}
        </label>
        <input
          type="text"
          aria-autocomplete="list"
          autoComplete="off"
          role="combobox"
          aria-controls={`quicksearch-listbox-${this.props.id}`}
          aria-haspopup="listbox"
          aria-activedescendant={
            this.state.focusedOption
              ? `${this.props.id}_choice_${this.state.focusedOption}`
              : undefined
          }
          aria-expanded={this.state.expanded}
          id={this.props.id}
          value={this.state.value}
          name={this.props.name}
          placeholder={this.props.placeholder}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          onFocus={this.handleFocus}
        ></input>
        <ul
          aria-labelledby={`label_${this.props.id}`}
          className={this.state.expanded ? "" : "hidden"}
          role="listbox"
          id={`quicksearch-listbox-${this.props.id}`}
        >
          {this.state.filteredOptions.map((el, index) => (
            <li
              key={index}
              role="option"
              aria-selected={
                index === this.state.focusedOption ? true : undefined
              }
              className={index === this.state.focusedOption ? "focused" : ""}
              id={`${this.props.id}_choice_${index}`}
              onMouseEnter={() => this.setState({ focusedOption: index })}
              onClick={this.clickChoice}
            >
              {el}
            </li>
          ))}
        </ul>
      </form>
    );
  }
}
