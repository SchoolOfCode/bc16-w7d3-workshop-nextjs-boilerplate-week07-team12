"use client";

import "./header.css";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import Logo from "../../assets/logo-small.png";

function Header({ links }) {
  const [navShown, setNavShown] = useState(false);

  const toggleNav = () => {
    setNavShown(!navShown);
  };

  return (
    <header
      className={navShown ? "header__nav-open" : undefined}
      onClick={(e) =>
        (navShown && e.target.className === "header__nav-open") ||
        e.target.className === "nav__link"
          ? toggleNav()
          : undefined
      }
    >
      <Image
        src={Logo}
        placeholder="empty"
        alt="logo image"
        width="160"
        height="60"
        className="header__logo"
      />
      <div className="nav__wrapper">
        <nav className="nav__wrapper-primary" aria-label="Primary navigation">
          <ul className="nav__list-primary">
            {links.map((link, index) => (
              <li className="nav__link-primary" key={index}>
                <Link className="nav__link" href={link.location}>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav
          className={
            navShown
              ? "nav__wrapper-mobile nav__drawer-open"
              : "nav__wrapper-mobile"
          }
          aria-label="Mobile navigation"
        >
          <button
            type="button"
            className={
              navShown ? "nav__button-mobile" : "nav__hide nav__button-mobile"
            }
            onClick={toggleNav}
          >
            <span
              className={
                navShown
                  ? "line-md--menu-to-close-transition"
                  : "line-md--close-to-menu-transition"
              }
            />
          </button>
          <ul className="nav__list-mobile">
            {links.map((link, index) => (
              <li className="nav__link" key={index}>
                <Link className="nav__link" href={link.location}>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          className={
            navShown ? "nav__hide nav__button-mobile" : "nav__button-mobile"
          }
          onClick={toggleNav}
        >
          <span
            className={
              navShown
                ? "line-md--menu-to-close-transition"
                : "line-md--close-to-menu-transition"
            }
          />
        </button>
      </div>
    </header>
  );
}

export default Header;
