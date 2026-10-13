import "./SearchBar.css";

type SearchBarProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  overHero: boolean;
};

function SearchBar({ value, placeholder, onChange, overHero }: SearchBarProps) {
  return (
    <div className={overHero ? "search-bar search-bar--over-hero" : "search-bar"}>
      <label className={value !== "" ? "search-bar-field filled" : "search-bar-field"}>
        <span className="search-bar-icon" aria-hidden="true">
          ⌕
        </span>

        <input
          type="search"
          placeholder={placeholder}
          aria-label={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") onChange("");
          }}
        />

        {value !== "" && (
          <button
            type="button"
            className="search-bar-clear"
            onClick={() => onChange("")}
            aria-label="Effacer la recherche"
          >
            ×
          </button>
        )}
      </label>
    </div>
  );
}

export default SearchBar;
