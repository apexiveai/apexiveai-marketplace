"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  BriefcaseBusiness,
  CarFront,
  Check,
  Gem,
  Globe2,
  HardHat,
  HeartPulse,
  Landmark,
  Menu,
  MessageCircle,
  Package,
  Quote,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Star,
  X,
} from "lucide-react";

import {
  fetchCollection,
  getRecordDescription,
  getRecordImage,
  getRecordName,
  type ApiRecord,
  type ApiResult,
} from "@/lib/api";

type CollectionState = {
  data: ApiRecord[];
  loading: boolean;
  error: string | null;
};

const emptyState: CollectionState = {
  data: [],
  loading: true,
  error: null,
};

const industryIcons = [
  Store,
  HeartPulse,
  CarFront,
  Landmark,
  Gem,
  HardHat,
  BriefcaseBusiness,
  Building2,
  Package,
];

const testimonials = [
  {
    quote: "ApexiveAI helped us reach the right customers across several industries and made our first listings incredibly easy to manage.",
    name: "Thidar Moe",
    role: "Founder, Greenline Foods",
  },
  {
    quote: "The verified business profile gives our customers confidence before they even contact us. It has become an essential sales channel.",
    name: "Kyaw Zin",
    role: "Director, Meridian Construction",
  },
  {
    quote: "We found reliable partners quickly and can now showcase services, pricing and availability all in one place.",
    name: "Hnin Ei",
    role: "Operations Manager, Nova Services",
  },
];

function fetchMarketplace(): Promise<
  [ApiResult<ApiRecord>, ApiResult<ApiRecord>, ApiResult<ApiRecord>]
> {
  return Promise.all([
    fetchCollection("/industries/"),
    fetchCollection("/organizations/"),
    fetchCollection("/marketplace/listings/"),
  ]);
}

function formatListingPrice(listing: ApiRecord): string {
  if (listing.price === null || listing.price === undefined || listing.price === "") {
    return "Contact for price";
  }

  const amount = Number(listing.price);
  if (!Number.isFinite(amount)) return "Contact for price";

  const formattedAmount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(amount);
  const currency =
    typeof listing.currency === "string" && /^[A-Z]{3}$/.test(listing.currency)
      ? listing.currency
      : "";

  return currency ? `${formattedAmount} ${currency}` : formattedAmount;
}

function CollectionMessage({
  loading,
  error,
  emptyText,
  onRetry,
}: {
  loading: boolean;
  error: string | null;
  emptyText: string;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <div className="storefront-message" role="status">
        <RefreshCw className="spin-icon" size={20} />
        <p>Loading marketplace…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="storefront-message" role="alert">
        <p>{error}</p>
        <button className="storefront-retry" onClick={onRetry}>
          <RefreshCw size={15} /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className="storefront-message">
      <Package size={23} />
      <p>{emptyText}</p>
    </div>
  );
}

export default function HomePage() {
  const [industries, setIndustries] = useState<CollectionState>(emptyState);
  const [companies, setCompanies] = useState<CollectionState>(emptyState);
  const [listings, setListings] = useState<CollectionState>(emptyState);
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  function applyMarketplaceResults(
    industryResult: ApiResult<ApiRecord>,
    companyResult: ApiResult<ApiRecord>,
    listingResult: ApiResult<ApiRecord>,
  ) {
    setIndustries({
      data: industryResult.data,
      loading: false,
      error: industryResult.error,
    });
    setCompanies({
      data: companyResult.data,
      loading: false,
      error: companyResult.error,
    });
    setListings({
      data: listingResult.data,
      loading: false,
      error: listingResult.error,
    });
  }

  useEffect(() => {
    let active = true;

    void fetchMarketplace().then(([industryResult, companyResult, listingResult]) => {
      if (active) {
        applyMarketplaceResults(industryResult, companyResult, listingResult);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  async function loadMarketplace() {
    setIndustries((current) => ({ ...current, loading: true, error: null }));
    setCompanies((current) => ({ ...current, loading: true, error: null }));
    setListings((current) => ({ ...current, loading: true, error: null }));

    const [industryResult, companyResult, listingResult] = await fetchMarketplace();
    applyMarketplaceResults(industryResult, companyResult, listingResult);
  }

  const query = search.trim().toLowerCase();
  const filteredIndustries = useMemo(() => {
    if (!query) return industries.data;

    return industries.data.filter((industry) =>
      `${getRecordName(industry)} ${getRecordDescription(industry)}`
        .toLowerCase()
        .includes(query),
    );
  }, [industries.data, query]);

  const filteredListings = useMemo(() => {
    if (!query) return listings.data;

    return listings.data.filter((listing) =>
      `${getRecordName(listing)} ${getRecordDescription(listing)} ${String(
        listing.organization_name || "",
      )}`
        .toLowerCase()
        .includes(query),
    );
  }, [listings.data, query]);

  const latestListings = useMemo(() => {
    return [...filteredListings].sort((first, second) => {
      const firstDate = Date.parse(
        String(first.created_at || first.updated_at || first.published_at || ""),
      );
      const secondDate = Date.parse(
        String(second.created_at || second.updated_at || second.published_at || ""),
      );

      if (Number.isNaN(firstDate) || Number.isNaN(secondDate)) {
        return 0;
      }

      return secondDate - firstDate;
    });
  }, [filteredListings]);

  const heroListing =
    listings.data.find((listing) => listing.is_featured && getRecordImage(listing)) ||
    listings.data.find((listing) => getRecordImage(listing));
  const heroImage = heroListing ? getRecordImage(heroListing) : null;

  return (
    <main className="storefront">
      <div className="storefront-announcement">
        <span><ShieldCheck size={14} /> Discover approved businesses</span>
        <i aria-hidden="true" />
        <span><Globe2 size={14} /> Explore every industry</span>
        <i aria-hidden="true" />
        <span><ArrowUpRight size={14} /> Connect directly with sellers</span>
      </div>

      <header className="storefront-header">
        <div className="storefront-header-main">
          <Link href="/" className="storefront-brand" aria-label="ApexiveAI Marketplace home">
            <span className="storefront-brand-mark"><Globe2 size={27} strokeWidth={1.5} /></span>
            <span className="storefront-brand-copy">
              <strong>APEXIVE</strong>
              <small>AI MARKETPLACE</small>
            </span>
          </Link>

          <form
            className="storefront-search"
            onSubmit={(event) => {
              event.preventDefault();
              document.getElementById("storefront-listings")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            <Search size={18} />
            <input
              aria-label="Search products, services and industries"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, services and businesses..."
              value={search}
            />
            <button type="submit" aria-label="Search marketplace">
              <Search size={18} />
            </button>
          </form>

          <div className="storefront-account">
            <Link href="/login" className="storefront-account-link">
              <Building2 size={20} />
              <span>Account</span>
            </Link>
            <Link href="/register" className="storefront-seller-link">
              Sell with us <ArrowRight size={14} />
            </Link>
          </div>

          <button
            className="storefront-menu-toggle"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        <nav className={`storefront-nav${mobileOpen ? " is-open" : ""}`}>
          <Link
            href="#industries"
            className="storefront-category-button"
            onClick={() => setMobileOpen(false)}
          >
            <Menu size={16} /> All industries
          </Link>
          <Link href="#home" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link href="#industries" onClick={() => setMobileOpen(false)}>Industries</Link>
          <Link href="#storefront-listings" onClick={() => setMobileOpen(false)}>Marketplace</Link>
          <Link href="#companies" onClick={() => setMobileOpen(false)}>Businesses</Link>
          <Link href="/register" onClick={() => setMobileOpen(false)}>Join the network</Link>
        </nav>
      </header>

      <div className="storefront-content">
        <section className="storefront-hero" id="home">
          <div className="storefront-hero-copy">
            <span className="storefront-eyebrow"><Sparkles size={14} /> THE APEXIVEAI MARKETPLACE</span>
            <h1>Discover what<br />moves you forward.</h1>
            <p>
              Explore products, services and trusted businesses from every
              industry—all in one connected marketplace.
            </p>
            <Link href="#storefront-listings" className="storefront-primary-button">
              Explore marketplace <ArrowRight size={16} />
            </Link>
            <div className="storefront-hero-trust">
              <span><BadgeCheck size={16} /> Approved businesses</span>
              <span><Globe2 size={16} /> One global network</span>
            </div>
          </div>

          <div className={`storefront-hero-art${heroImage ? " has-image" : ""}`}>
            {heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroImage} alt={heroListing ? getRecordName(heroListing) : ""} />
            ) : (
              <div className="storefront-hero-placeholder" aria-hidden="true">
                <span className="hero-plant hero-plant-one" />
                <span className="hero-plant hero-plant-two" />
                <div className="hero-product-mark"><Package size={88} strokeWidth={1} /></div>
              </div>
            )}
            {heroListing && (
              <div className="storefront-hero-product">
                <span>{heroListing.is_featured ? "FEATURED LISTING" : "FROM THE MARKETPLACE"}</span>
                <strong>{getRecordName(heroListing)}</strong>
                <small>{formatListingPrice(heroListing)}</small>
              </div>
            )}
            <div className="storefront-hero-badge">
              <span>Discover</span>
              <strong>more</strong>
              <span>together</span>
            </div>
          </div>
        </section>

        <section className="storefront-categories" id="industries">
          <div className="storefront-section-heading">
            <div>
              <span className="storefront-section-kicker">FIND YOUR SPACE</span>
              <h2>Featured categories</h2>
            </div>
            <Link href="#industries" className="storefront-view-link">
              View all <ArrowRight size={15} />
            </Link>
          </div>

          {filteredIndustries.length > 0 && !industries.error ? (
            <div className="storefront-category-list">
              {filteredIndustries.map((industry, index) => {
                const Icon = industryIcons[index % industryIcons.length];
                const image = getRecordImage(industry);

                return (
                  <Link
                    className="storefront-category-item"
                    href={`/industries/${industry.slug || industry.id}`}
                    key={industry.id}
                  >
                    <span className={`storefront-category-icon category-tone-${index % 6}`}>
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt="" />
                      ) : (
                        <Icon size={25} strokeWidth={1.6} />
                      )}
                    </span>
                    <span>{getRecordName(industry)}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <CollectionMessage
              loading={industries.loading}
              error={industries.error}
              emptyText={
                query
                  ? "No industries matched your search."
                  : "Industry categories will appear here once they are published."
              }
              onRetry={loadMarketplace}
            />
          )}
        </section>

        <section className="storefront-featured" id="storefront-listings">
          <div className="storefront-section-heading">
            <div>
              <span className="storefront-section-kicker">NEW FROM ACROSS THE NETWORK</span>
              <h2>Latest listings <Sparkles size={19} /></h2>
            </div>
            <Link href="/marketplace" className="storefront-view-link">
              See marketplace <ArrowRight size={15} />
            </Link>
          </div>

          {latestListings.length > 0 && !listings.error ? (
            <div className="storefront-product-grid">
              {latestListings.slice(0, 5).map((listing) => {
                const image = getRecordImage(listing);
                const listingType = String(listing.listing_type || "Listing");

                return (
                  <article className="storefront-product-card" key={listing.id}>
                    <Link
                      className="storefront-product-media"
                      href={`/marketplace/${listing.slug || listing.id}`}
                      aria-label={`View ${getRecordName(listing)}`}
                    >
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={getRecordName(listing)} />
                      ) : (
                        <span className="storefront-product-placeholder"><Package size={49} /></span>
                      )}
                      <span className="storefront-product-badge">
                        {listing.is_featured ? "Featured" : listingType}
                      </span>
                    </Link>
                    <div className="storefront-product-info">
                      <span className="storefront-product-seller">
                        {String(listing.organization_name || "Marketplace seller")}
                      </span>
                      <h3>
                        <Link href={`/marketplace/${listing.slug || listing.id}`}>
                          {getRecordName(listing)}
                        </Link>
                      </h3>
                      <p>{getRecordDescription(listing)}</p>
                      <div className="storefront-product-bottom">
                        <strong>{formatListingPrice(listing)}</strong>
                        <Link
                          href={`/marketplace/${listing.slug || listing.id}`}
                          aria-label={`View details for ${getRecordName(listing)}`}
                          className="storefront-product-action"
                        >
                          <ArrowUpRight size={17} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <CollectionMessage
              loading={listings.loading}
              error={listings.error}
              emptyText={
                query
                  ? "No listings matched your search."
                  : "No published marketplace listings are available yet."
              }
              onRetry={loadMarketplace}
            />
          )}
        </section>

        <section className="storefront-businesses" id="companies">
          <div className="storefront-section-heading">
            <div>
              <span className="storefront-section-kicker">MEET THE SELLERS</span>
              <h2>Businesses to know</h2>
            </div>
            <Link href="/companies" className="storefront-view-link">
              Browse businesses <ArrowRight size={15} />
            </Link>
          </div>

          {companies.data.length > 0 && !companies.error ? (
            <div className="storefront-business-grid">
              {companies.data.slice(0, 3).map((company) => {
                const image = getRecordImage(company);

                return (
                  <Link
                    className="storefront-business-card"
                    href={`/companies/${company.slug || company.id}`}
                    key={company.id}
                  >
                    <span className="storefront-business-image">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt="" />
                      ) : (
                        <Building2 size={34} strokeWidth={1.2} />
                      )}
                    </span>
                    <span className="storefront-business-copy">
                      <strong>{getRecordName(company)}</strong>
                      <small>{getRecordDescription(company)}</small>
                      {Boolean(company.is_verified) && (
                        <span className="storefront-business-verified">
                          <BadgeCheck size={12} /> Verified business
                        </span>
                      )}
                      <span className="storefront-business-link">
                        View business <ArrowRight size={14} />
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <CollectionMessage
              loading={companies.loading}
              error={companies.error}
              emptyText="Approved businesses will appear here."
              onRetry={loadMarketplace}
            />
          )}
        </section>

        <section className="storefront-testimonials" aria-labelledby="testimonial-heading">
          <div className="storefront-section-heading">
            <div>
              <span className="storefront-section-kicker">CUSTOMER STORIES</span>
              <h2 id="testimonial-heading">Trusted by growing businesses</h2>
            </div>
            <div className="storefront-rating" aria-label="Five star marketplace rating">
              {[0, 1, 2, 3, 4].map((star) => (
                <Star key={star} size={13} fill="currentColor" />
              ))}
            </div>
          </div>
          <div className="storefront-testimonial-grid">
            {testimonials.map((testimonial) => (
              <article className="storefront-testimonial-card" key={testimonial.name}>
                <Quote className="storefront-quote-icon" size={24} />
                <p>{testimonial.quote}</p>
                <div>
                  <span>{testimonial.name.charAt(0)}</span>
                  <strong>
                    {testimonial.name}
                    <small>{testimonial.role}</small>
                  </strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="storefront-pricing" aria-labelledby="pricing-heading">
          <div className="storefront-section-heading">
            <div>
              <span className="storefront-section-kicker">SIMPLE BUSINESS PACKAGES</span>
              <h2 id="pricing-heading">Choose how you want to grow</h2>
            </div>
          </div>
          <div className="storefront-pricing-grid">
            <article className="storefront-pricing-card">
              <span>Starter</span>
              <h3>Free</h3>
              <p>Get discovered and publish your first business profile.</p>
              <ul>
                <li><Check size={14} /> Business profile</li>
                <li><Check size={14} /> 1 marketplace listing</li>
                <li><Check size={14} /> Direct enquiries</li>
              </ul>
              <Link href="/register" className="storefront-pricing-button">
                Join for free <ArrowRight size={15} />
              </Link>
            </article>
            <article className="storefront-pricing-card is-featured">
              <span className="storefront-plan-badge">Most popular</span>
              <span>Business</span>
              <h3>Grow</h3>
              <p>Build visibility across industries and manage more listings.</p>
              <ul>
                <li><Check size={14} /> Verified business badge</li>
                <li><Check size={14} /> Unlimited listings</li>
                <li><Check size={14} /> Priority marketplace placement</li>
              </ul>
              <Link href="/register" className="storefront-primary-button">
                Join the network <ArrowRight size={15} />
              </Link>
            </article>
            <article className="storefront-pricing-card">
              <span>Enterprise</span>
              <h3>Scale</h3>
              <p>For networks and teams that need dedicated support.</p>
              <ul>
                <li><Check size={14} /> Multi-location profiles</li>
                <li><Check size={14} /> Campaign support</li>
                <li><Check size={14} /> Account management</li>
              </ul>
              <Link href="/register" className="storefront-pricing-button">
                Talk to us <ArrowRight size={15} />
              </Link>
            </article>
          </div>
        </section>

        <section className="storefront-benefits" aria-label="Marketplace benefits">
          <div><ShieldCheck size={23} /><span><strong>Approved businesses</strong><small>Trusted publishing workflow</small></span></div>
          <div><MessageCircle size={23} /><span><strong>Direct enquiries</strong><small>Connect with sellers directly</small></span></div>
          <div><Building2 size={23} /><span><strong>Business network</strong><small>Built for growing businesses</small></span></div>
          <div><Globe2 size={23} /><span><strong>Multi-industry</strong><small>One connected marketplace</small></span></div>
        </section>
      </div>

      <footer className="storefront-footer">
        <div className="storefront-footer-main">
          <Link href="/" className="storefront-brand" aria-label="ApexiveAI Marketplace home">
            <span className="storefront-brand-mark"><Globe2 size={25} strokeWidth={1.5} /></span>
            <span className="storefront-brand-copy">
              <strong>APEXIVE</strong>
              <small>AI MARKETPLACE</small>
            </span>
          </Link>
          <p>Your connected network for discovering businesses, products and services.</p>
          <div className="storefront-footer-links">
            <div><strong>Explore</strong><Link href="#industries">Industries</Link><Link href="/marketplace">Marketplace</Link><Link href="/companies">Businesses</Link></div>
            <div><strong>For business</strong><Link href="/register">Create an account</Link><Link href="/login">Sign in</Link></div>
          </div>
        </div>
        <div className="storefront-footer-bottom">
          <span>© 2026 APEXIVEAI MARKETPLACE</span>
          <span>Built for businesses. Open to every industry.</span>
        </div>
      </footer>
    </main>
  );
}
